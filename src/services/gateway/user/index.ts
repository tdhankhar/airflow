import { Request, Response, NextFunction } from "express";
import UserService from "../../user-service";
import { AuthenticatedRequest } from "../../common/interface";
import Errors from "../../common/errors";

const isLoggedIn = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    throw Errors.AUTH_FAILED;
  }
  const user = await UserService.authorize({ token });
  req.username = user.username;
  return next();
};

const getUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  const { username } = req;
  if (!username) {
    throw Errors.BAD_REQUEST;
  }
  const user = await UserService.getUser({ username });
  return res.json({ user });
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw Errors.BAD_REQUEST;
  }
  const token = await UserService.authenticate({ username, password });
  return res.json({ token });
};

const signup = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || username.length < 5 || !password || password.length < 5) {
    throw Errors.BAD_REQUEST;
  }
  const user = await UserService.createUser({ username, password });
  return res.json({ user });
};

export default {
  isLoggedIn,
  getUserDetails,
  login,
  signup,
};
