import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserDm } from "./dm";
import Errors from "../common/errors";
import Constants from "./constants";

const authorize = async (params: { token: string }) => {
  const { token } = params;
  const payload = jwt.verify(token, process.env.AIRFLOW_JWT_SECRET_KEY as string) as JwtPayload;
  const { key } = payload;
  return { username: key };
};

const authenticate = async (params: { username: string; password: string }) => {
  const { username, password } = params;
  const user = await UserDm.findByUsername(username);
  if (!user) {
    throw Errors.DATA_NOT_FOUND;
  }
  const isAuthenticated = await bcrypt.compare(password, user.hashedPassword);
  if (!isAuthenticated) {
    throw Errors.AUTH_FAILED;
  }
  return jwt.sign({ key: user.username }, process.env.AIRFLOW_JWT_SECRET_KEY as string, { expiresIn: Constants.JWT_EXPIRY });
};

const getUser = async (params: { username: string }) => {
  const { username } = params;
  return UserDm.findByUsername(username);
};

const createUser = async (params: { username: string; password: string }) => {
  const { username, password } = params;
  const salt = await bcrypt.genSalt(5);
  const hashedPassword = await bcrypt.hash(password, salt);
  return UserDm.createUser(username, hashedPassword);
};

export default {
  authorize,
  authenticate,
  getUser,
  createUser,
};
