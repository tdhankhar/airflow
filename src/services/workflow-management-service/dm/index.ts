import { InstanceState, WorkflowConfig, WorkflowInstance } from "@prisma/client";
import { db } from "../../../clients";

const parseWorkflowConfig = (config: WorkflowConfig) => {
  return {
    id: config.id,
    workflowName: config.workflow_name,
    active: config.active,
    cronExpression: config.cron_expression,
    createdAt: config.created_at,
    updatedAt: config.updated_at,
  };
};

const WorkflowConfigDm = {
  createWorkflowConfig: async (workflowName: string, cronExpression: string) => {
    const config = await db.workflowConfig.create({
      data: {
        workflow_name: workflowName,
        cron_expression: cronExpression,
      },
    });
    return parseWorkflowConfig(config);
  },
  updateWorkflowConfig: async (workflowId: string, cronExpression: string, active: boolean) => {
    const config = await db.workflowConfig.update({
      where: {
        id: workflowId,
      },
      data: {
        cron_expression: cronExpression,
        active: active,
      },
    });
    return parseWorkflowConfig(config);
  },
  findByWorkflowId: async (workflowId: string) => {
    const config = await db.workflowConfig.findUnique({
      where: {
        id: workflowId,
      },
    });
    if (!config) return;
    return parseWorkflowConfig(config);
  },
};

const parseWorkflowInstance = (instance: WorkflowInstance) => {
  return {
    id: instance.id,
    state: instance.state,
    executionTimestamp: instance.execution_timestamp,
    createdAt: instance.created_at,
    updatedAt: instance.updated_at,
    workflowId: instance.workflow_id,
  };
};

const WorkflowInstanceDm = {
  createWorkflowInstance: async (workflowId: string, executionTimestamp?: Date) => {
    const instanceState = executionTimestamp ? InstanceState.SCHEDULED : undefined;
    const instance = await db.workflowInstance.create({
      data: {
        workflow_id: workflowId,
        execution_timestamp: executionTimestamp,
        state: instanceState,
      },
    });
    return parseWorkflowInstance(instance);
  },
  updateWorkflowInstanceState: async (instanceId: string, instanceState: InstanceState) => {
    const instance = await db.workflowInstance.update({
      where: {
        id: instanceId,
      },
      data: {
        state: instanceState,
      },
    });
    return parseWorkflowInstance(instance);
  },
  updateInstanceStateInBulk: async (instanceIds: string[], instanceState: InstanceState) => {
    return db.workflowInstance.updateMany({
      where: {
        id: {
          in: instanceIds,
        },
      },
      data: {
        state: instanceState,
      },
    });
  },
  findByInstanceId: async (instanceId: string) => {
    const instance = await db.workflowInstance.findUnique({
      where: {
        id: instanceId,
      },
    });
    if (!instance) return;
    return parseWorkflowInstance(instance);
  },
  findByQuery: async (query: { workflowId?: string; instanceState?: InstanceState; executionTimestamp?: Date }) => {
    const { workflowId, instanceState, executionTimestamp } = query;
    const instances = await db.workflowInstance.findMany({
      where: {
        workflow_id: workflowId,
        state: instanceState,
        execution_timestamp: {
          lte: executionTimestamp,
        },
      },
    });
    return instances.map(parseWorkflowInstance);
  },
};

export { WorkflowConfigDm, WorkflowInstanceDm };
