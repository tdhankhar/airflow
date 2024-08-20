import { InstanceState } from "@prisma/client";
import { docker, s3 } from "../clients";
import WorkflowManagementService from "../services/workflow-management-service";
import Constants from "./constants";

const pullImage = async (image: string) => {
  return new Promise((resolve, reject) => {
    docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) reject(err);
      docker.modem.followProgress(stream, (err: Error | null) => {
        if (err) reject(err);
        resolve(0);
      });
    });
  });
};

const runContainer = async (image: string, workflowName: string, instanceId: string) => {
  try {
    await pullImage(image);
    const container = await docker.createContainer({
      Image: image,
      Cmd: [Constants.WORKER_CMD, workflowName],
      HostConfig: {
        NanoCpus: Constants.WORKER_HOST_CONFIG.NANO_CPUS,
        Memory: Constants.WORKER_HOST_CONFIG.MEMORY,
        MemorySwap: Constants.WORKER_HOST_CONFIG.MEMORY_SWAPS,
      },
      AttachStdout: true,
      AttachStderr: true,
    });
    await container.start();
    const stream = await container.logs({ follow: true, stdout: true, stderr: true });
    let logs = "";
    stream.on("data", async (chunk) => {
      logs += chunk.slice(8).toString("utf8");
    });
    const result = await container.wait();
    await container.remove();
    await s3.put(`${instanceId}.txt`, logs, "text/plain");
    return result.StatusCode;
  } catch (err) {
    await s3.put(`${instanceId}.txt`, JSON.stringify(err), "text/plain");
    return 1;
  }
};

export default async (payload: { instanceId: string }) => {
  const { instanceId } = payload;
  const { workflowId } = await WorkflowManagementService.updateWorkflowInstanceState({
    instanceId,
    instanceState: InstanceState.RUNNING,
  });
  const configs = await WorkflowManagementService.getWorkflowConfigs({ workflowId });
  if (configs.length === 0) {
    await WorkflowManagementService.updateWorkflowInstanceState({ instanceId, instanceState: InstanceState.FAILED });
    await WorkflowManagementService.scheduleInstanceIfRequired({ workflowId });
    return;
  }
  const { workflowName, baseImage } = configs[0];
  const image = `${process.env.AIRFLOW_CONTAINER_REGISTRY_USERNAME}/${baseImage}`;
  const statusCode = await runContainer(image, workflowName, instanceId);
  await WorkflowManagementService.updateWorkflowInstanceState({
    instanceId,
    instanceState: statusCode === 0 ? InstanceState.SUCCESS : InstanceState.FAILED,
  });
  await WorkflowManagementService.scheduleInstanceIfRequired({ workflowId });
};
