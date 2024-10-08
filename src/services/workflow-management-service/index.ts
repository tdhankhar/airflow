import { InstanceState } from "@prisma/client";
import { WorkflowConfigDm, WorkflowInstanceDm } from "./dm";
import Errors from "../common/errors";
import cronParser from "cron-parser";
import Constants from "./constants";
import { eventProducer } from "../../clients";

const validateCronExpression = (cronExpression: string) => {
  if (cronExpression === Constants.ONE_TIME_CRON_EXPRESSION) {
    return;
  }
  try {
    const interval = cronParser.parseExpression(cronExpression);
    const seconds = interval.fields.second;
    if (seconds.length !== 1 || seconds[0] !== 0) {
      throw Errors.BAD_REQUEST;
    }
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
};

const createWorkflowConfig = async (params: { workflowName: string; cronExpression: string; baseImage: string }) => {
  const { workflowName, cronExpression, baseImage } = params;
  validateCronExpression(cronExpression);
  return WorkflowConfigDm.createWorkflowConfig(workflowName, cronExpression, baseImage);
};

const updateWorkflowConfig = async (params: {
  workflowId: string;
  active: boolean;
  cronExpression: string;
  baseImage: string;
}) => {
  const { workflowId, active, cronExpression, baseImage } = params;
  if (cronExpression) {
    validateCronExpression(cronExpression);
  }
  return WorkflowConfigDm.updateWorkflowConfig(workflowId, active, cronExpression, baseImage);
};

const getWorkflowConfigs = async (params: { workflowId?: string }) => {
  return WorkflowConfigDm.findByQuery(params);
};

const createWorkflowInstance = async (params: { workflowId: string }) => {
  const { workflowId } = params;
  return WorkflowInstanceDm.createWorkflowInstance(workflowId);
};

const triggerWorkflowInstance = async (params: { instanceId: string }) => {
  const { instanceId } = params;
  const payload = { instanceId };
  await eventProducer.send({
    topic: Constants.TOPICS.WORKFLOW_TRIGGERED,
    messages: [{ value: JSON.stringify(payload) }],
  });
  return WorkflowInstanceDm.updateWorkflowInstanceState(instanceId, InstanceState.QUEUED);
};

const updateWorkflowInstanceState = async (params: { instanceId: string; instanceState: InstanceState }) => {
  const { instanceId, instanceState } = params;
  return WorkflowInstanceDm.updateWorkflowInstanceState(instanceId, instanceState);
};

const updateInstanceStateInBulk = async (params: { instanceIds: string[]; instanceState: InstanceState }) => {
  const { instanceIds, instanceState } = params;
  return WorkflowInstanceDm.updateInstanceStateInBulk(instanceIds, instanceState);
};

const archiveScheduledInstancesInBulk = async (params: { workflowId: string }) => {
  const { workflowId } = params;
  const instances = await WorkflowInstanceDm.findByQuery({ workflowId, instanceState: InstanceState.SCHEDULED });
  const instanceIds = instances.map((instance) => instance.id);
  return WorkflowInstanceDm.updateInstanceStateInBulk(instanceIds, InstanceState.ARCHIVED);
};

const scheduleInstanceIfRequired = async (params: { workflowId: string }) => {
  const { workflowId } = params;
  const [config, scheduledInstances] = await Promise.all([
    WorkflowConfigDm.findByWorkflowId(workflowId),
    WorkflowInstanceDm.findByQuery({ workflowId, instanceState: InstanceState.SCHEDULED }),
  ]);
  if (!config) {
    throw Errors.DATA_NOT_FOUND;
  }
  const { cronExpression, active } = config;
  if (!active || cronExpression === Constants.ONE_TIME_CRON_EXPRESSION || scheduledInstances.length) {
    return;
  }
  const interval = cronParser.parseExpression(cronExpression);
  const executionTimestamp = interval.next().toDate();
  return WorkflowInstanceDm.createWorkflowInstance(workflowId, executionTimestamp);
};

const getWorkflowInstances = async (params: {
  instanceId?: string;
  workflowId?: string;
  instanceState?: InstanceState;
  executionTimestamp?: Date;
}) => {
  return WorkflowInstanceDm.findByQuery(params);
};

export default {
  createWorkflowConfig,
  getWorkflowConfigs,
  updateWorkflowConfig,
  createWorkflowInstance,
  triggerWorkflowInstance,
  updateWorkflowInstanceState,
  archiveScheduledInstancesInBulk,
  scheduleInstanceIfRequired,
  getWorkflowInstances,
  updateInstanceStateInBulk,
};
