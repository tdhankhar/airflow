import { Request } from "express";

interface MyError extends Error {
  statusCode: number;
}

interface AuthenticatedRequest extends Request {
  username?: string;
}

export { MyError, AuthenticatedRequest };
