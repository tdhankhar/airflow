import { eventProducer } from "../clients";
import WorkflowContants from "../services/workflow-management-service/constants";
import WorkflowManagementService from "../services/workflow-management-service";
import { InstanceState } from "@prisma/client";

const scheduleWorkflows = async () => {
  setInterval(async () => {
    const instances = await WorkflowManagementService.getWorkflowInstances({
      instanceState: InstanceState.SCHEDULED,
      executionTimestamp: new Date(),
    });
    if (instances.length === 0) {
      return;
    }
    const instanceIds = instances.map((instance) => instance.id);
    const messages = instanceIds.map((instanceId) => ({ value: JSON.stringify({ instanceId }) }));
    await eventProducer.send({ topic: WorkflowContants.TOPICS.WORKFLOW_TRIGGERED, messages });
    await WorkflowManagementService.updateInstanceStateInBulk({ instanceIds, instanceState: InstanceState.QUEUED });
  }, 10000);
};

export default async () => {
  await eventProducer.connect();
  console.log("SCHEDULER STARTED");
  await scheduleWorkflows();
};
