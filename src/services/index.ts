import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import gateway from "./gateway";
import Errors from "./common/errors";
import { MyError } from "./common/interface";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api", gateway);
app.use((err: MyError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || Errors.INTERNAL_SERVER_ERROR.statusCode;
  const message = err.message || Errors.INTERNAL_SERVER_ERROR.message;
  return res.status(statusCode).json({ statusCode, message });
});
app.use(express.static(path.join(__dirname, "..", "..", "static")));
app.use((_req, res, _next) => {
  return res.sendFile(path.join(__dirname, "..", "..", "static", "index.html"));
});

export default async () => {
  const PORT = 8080;
  app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT: ${PORT}`);
  });
};
