import { db } from "../clients";

export default async () => {
  await db.$connect();
  console.log("DB CONNECTED");
};
