import { InstanceState } from "@prisma/client";
import { docker, s3 } from "../clients";
import WorkflowManagementService from "../services/workflow-management-service";
import Constants from "./constants";

const pullImage = async (baseImage: string) => {
  return new Promise((resolve, reject) => {
    docker.pull(baseImage, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) reject(err);
      docker.modem.followProgress(stream, (err: Error | null) => {
        if (err) reject(err);
        resolve(0);
      });
    });
  });
};

const runContainer = async (baseImage: string, workflowName: string, instanceId: string) => {
  try {
    await pullImage(baseImage);
    const container = await docker.createContainer({
      Image: baseImage,
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
  const config = await WorkflowManagementService.getWorkflowConfig({ workflowId });
  if (!config) {
    await WorkflowManagementService.updateWorkflowInstanceState({ instanceId, instanceState: InstanceState.FAILED });
    await WorkflowManagementService.scheduleInstanceIfRequired({ workflowId });
    return;
  }
  const { workflowName } = config;
  const statusCode = await runContainer(Constants.WORKER_BASE_IMAGE, workflowName, instanceId);
  await WorkflowManagementService.updateWorkflowInstanceState({
    instanceId,
    instanceState: statusCode === 0 ? InstanceState.SUCCESS : InstanceState.FAILED,
  });
  await WorkflowManagementService.scheduleInstanceIfRequired({ workflowId });
};
