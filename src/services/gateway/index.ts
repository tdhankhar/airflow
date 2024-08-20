import express from "express";
import User from "./user";
import UserSchema from "./user/schema";
import Workflow from "./workflow";
import WorkflowSchema from "./workflow/schema";

const router = express.Router();

router.get("/user", User.isLoggedIn, UserSchema.getUserDetails, User.getUserDetails);
router.post("/logout", User.logout);
router.post("/login", UserSchema.login, User.login);
router.post("/signup", UserSchema.signup, User.signup);

router.get("/workflows", User.isLoggedIn, Workflow.getWorkflowConfigs);
router.get("/workflow/:workflowId", User.isLoggedIn, WorkflowSchema.getWorkflowConfig, Workflow.getWorkflowConfig);
router.get(
  "/workflow/:workflowId/instances",
  User.isLoggedIn,
  WorkflowSchema.getWorkflowInstances,
  Workflow.getWorkflowInstances
);
router.get(
  "/workflow/instance/:instanceId",
  User.isLoggedIn,
  WorkflowSchema.getWorkflowInstance,
  Workflow.getWorkflowInstance
);

router.post("/workflow", User.isLoggedIn, WorkflowSchema.createWorkflowConfig, Workflow.createWorkflowConfig);
router.put("/workflow", User.isLoggedIn, WorkflowSchema.updateWorkflowConfig, Workflow.updateWorkflowConfig);

router.post(
  "/workflow/instance/trigger",
  User.isLoggedIn,
  WorkflowSchema.triggerWorkflowInstance,
  Workflow.triggerWorkflowInstance
);
router.put(
  "/workflow/instance/archive",
  User.isLoggedIn,
  WorkflowSchema.archiveWorkflowInstance,
  Workflow.archiveWorkflowInstance
);

export default router;
