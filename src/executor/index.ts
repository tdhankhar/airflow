import { eventConsumer } from "../clients";
import WorkflowContants from "../services/workflow-management-service/constants";
import initWorker from "./worker";

const executeWorkflows = async () => {
  await eventConsumer.run({
    eachMessage: async ({ message }) => {
      const payloadBuffer = message?.value?.toString();
      if (payloadBuffer) {
        initWorker(JSON.parse(payloadBuffer));
      }
    },
  });
};

export default async () => {
  await eventConsumer.connect();
  await eventConsumer.subscribe({
    topic: WorkflowContants.TOPICS.WORKFLOW_TRIGGERED,
    fromBeginning: true,
  });
  console.log("EXECUTOR STARTED");
  await executeWorkflows();
};
