import express from "express";
import User from "./user";
import Workflow from "./workflow";

const router = express.Router();

router.get("/user", User.isLoggedIn, User.getUserDetails);
router.post("/login", User.login);
router.post("/signup", User.signup);

router.post("/workflow/config", User.isLoggedIn, Workflow.createWorkflowConfig);
router.put("/workflow/config", User.isLoggedIn, Workflow.updateWorkflowConfig);

router.post("/workflow/instance/trigger", User.isLoggedIn, Workflow.triggerWorkflowInstance);
router.put("/workflow/instance/archive", User.isLoggedIn, Workflow.archiveWorkflowInstance);

export default router;
