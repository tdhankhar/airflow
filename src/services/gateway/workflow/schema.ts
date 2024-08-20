import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../common/interface";
import Errors from "../../common/errors";
import { z } from "zod";

const createWorkflowConfig = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.object({
      workflowName: z.string().min(3),
      cronExpression: z.string(),
      baseImage: z.string(),
    }).parse(req.body);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

const updateWorkflowConfig = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.object({
      workflowId: z.string(),
      active: z.boolean(),
      cronExpression: z.optional(z.string()),
      baseImage: z.optional(z.string()),
    }).parse(req.body);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

const triggerWorkflowInstance = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.object({
      workflowId: z.string(),
    }).parse(req.body);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

const archiveWorkflowInstance = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.object({
      instanceId: z.string(),
    }).parse(req.body);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

const getWorkflowConfig = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.object({
      workflowId: z.string(),
    }).parse(req.params);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

const getWorkflowInstances = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.object({
      workflowId: z.string(),
    }).parse(req.params);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

const getWorkflowInstance = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.object({
      instanceId: z.string(),
    }).parse(req.params);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

export default {
  createWorkflowConfig,
  updateWorkflowConfig,
  triggerWorkflowInstance,
  archiveWorkflowInstance,
  getWorkflowConfig,
  getWorkflowInstances,
  getWorkflowInstance,
};
