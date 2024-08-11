import { Response } from "express";
import { AuthenticatedRequest } from "../../common/interface";
import WorkflowManagementService from "../../workflow-management-service";
import { InstanceState } from "@prisma/client";

const createWorkflowConfig = async (req: AuthenticatedRequest, res: Response) => {
  const { workflowName, cronExpression } = req.body;
  const config = await WorkflowManagementService.createWorkflowConfig({ workflowName, cronExpression });
  return res.json(config);
};

const updateWorkflowConfig = async (req: AuthenticatedRequest, res: Response) => {
  const { workflowId, cronExpression, active } = req.body;
  const config = await WorkflowManagementService.updateWorkflowConfig({ workflowId, cronExpression, active });
  await WorkflowManagementService.archiveScheduledInstancesInBulk({ workflowId });
  await WorkflowManagementService.scheduleInstanceIfRequired({ workflowId });
  return res.json(config);
};

const triggerWorkflowInstance = async (req: AuthenticatedRequest, res: Response) => {
  const { workflowId } = req.body;
  const instance = await WorkflowManagementService.createWorkflowInstance({ workflowId });
  const updatedInstance = await WorkflowManagementService.triggerWorkflowInstance({ instanceId: instance.id });
  return res.json(updatedInstance);
};

const archiveWorkflowInstance = async (req: AuthenticatedRequest, res: Response) => {
  const { instanceId } = req.body;
  const instance = await WorkflowManagementService.updateWorkflowInstanceState({
    instanceId,
    instanceState: InstanceState.ARCHIVED,
  });
  await WorkflowManagementService.scheduleInstanceIfRequired({ workflowId: instance.workflowId });
  return res.json(instance);
};

export default {
  createWorkflowConfig,
  updateWorkflowConfig,
  triggerWorkflowInstance,
  archiveWorkflowInstance,
};
