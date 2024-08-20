import { Response } from "express";
import { AuthenticatedRequest } from "../../common/interface";
import WorkflowManagementService from "../../workflow-management-service";
import { InstanceState } from "@prisma/client";
import { s3 } from "../../../clients";

const createWorkflowConfig = async (req: AuthenticatedRequest, res: Response) => {
  const { workflowName, cronExpression, baseImage } = req.body;
  const config = await WorkflowManagementService.createWorkflowConfig({ workflowName, cronExpression, baseImage });
  return res.json(config);
};

const updateWorkflowConfig = async (req: AuthenticatedRequest, res: Response) => {
  const { workflowId, active, cronExpression, baseImage } = req.body;
  const config = await WorkflowManagementService.updateWorkflowConfig({ workflowId, active, cronExpression, baseImage });
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

const getWorkflowConfigs = async (_req: AuthenticatedRequest, res: Response) => {
  const configs = await WorkflowManagementService.getWorkflowConfigs({});
  return res.json({
    configs: configs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  });
};

const getWorkflowConfig = async (req: AuthenticatedRequest, res: Response) => {
  const { workflowId } = req.params;
  const configs = await WorkflowManagementService.getWorkflowConfigs({ workflowId });
  return res.json({ config: configs[0] });
};

const getWorkflowInstances = async (req: AuthenticatedRequest, res: Response) => {
  const { workflowId } = req.params;
  const instances = await WorkflowManagementService.getWorkflowInstances({ workflowId });
  return res.json({
    instances: instances.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  });
};

const getWorkflowInstance = async (req: AuthenticatedRequest, res: Response) => {
  const { instanceId } = req.params;
  const instances = await WorkflowManagementService.getWorkflowInstances({ instanceId });
  const instance = instances[0] || {};
  try {
    const instanceLogStream = await s3.get(`${instanceId}.txt`);
    const instanceLogs = await instanceLogStream.Body?.transformToString();
    return res.json({ instance: { ...instance, instanceLogs } });
  } catch (_err) {
    return res.json({ instance });
  }
};

export default {
  createWorkflowConfig,
  updateWorkflowConfig,
  triggerWorkflowInstance,
  archiveWorkflowInstance,
  getWorkflowConfigs,
  getWorkflowConfig,
  getWorkflowInstances,
  getWorkflowInstance,
};
