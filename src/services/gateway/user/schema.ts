import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../common/interface";
import Errors from "../../common/errors";
import { z } from "zod";

const getUserDetails = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.string().min(3).parse(req.username);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

const login = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.object({
      username: z.string().min(3),
      password: z.string().min(3),
    }).parse(req.body);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

const signup = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    z.object({
      username: z.string().min(3),
      password: z.string().min(3),
    }).parse(req.body);
  } catch (_err) {
    throw Errors.BAD_REQUEST;
  }
  return next();
};

export default {
  getUserDetails,
  login,
  signup,
};
