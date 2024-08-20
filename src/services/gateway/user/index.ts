import { Request, Response, NextFunction } from "express";
import UserService from "../../user-service";
import { AuthenticatedRequest } from "../../common/interface";
import Errors from "../../common/errors";

const isLoggedIn = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    throw Errors.AUTH_FAILED;
  }
  const user = await UserService.authorize({ token });
  req.username = user.username;
  return next();
};

const getUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  const { username } = req;
  return res.json({ username });
};

const logout = async (_req: Request, res: Response) => {
  res.cookie("token", undefined);
  return res.json({ success: true });
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const token = await UserService.authenticate({ username, password });
  res.cookie("token", token);
  return res.json({ success: true });
};

const signup = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  await UserService.createUser({ username, password });
  return res.json({ success: true });
};

export default {
  isLoggedIn,
  getUserDetails,
  logout,
  login,
  signup,
};
