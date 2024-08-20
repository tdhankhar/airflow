import { eventConsumer, eventManager } from "../clients";
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
  await eventManager.connect();
  const topics = await eventManager.listTopics();
  if (!topics.includes(WorkflowContants.TOPICS.WORKFLOW_TRIGGERED)) {
    await eventManager.createTopics({
      topics: [{ topic: WorkflowContants.TOPICS.WORKFLOW_TRIGGERED }],
    });
    console.log("TOPIC CREATED");
  }
  await eventConsumer.connect();
  await eventConsumer.subscribe({
    topic: WorkflowContants.TOPICS.WORKFLOW_TRIGGERED,
    fromBeginning: true,
  });
  console.log("EXECUTOR STARTED");
  await executeWorkflows();
};
