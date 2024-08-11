import { User } from "@prisma/client";
import { db } from "../../../clients";

const parseUser = (user: User) => {
  return {
    username: user.username,
    hashedPassword: user.hashed_password,
  };
};

const UserDm = {
  findByUsername: async (username: string) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) return;
    return parseUser(user);
  },
  createUser: async (username: string, hashedPassword: string) => {
    const user = await db.user.create({
      data: {
        username,
        hashed_password: hashedPassword,
      },
    });
    return parseUser(user);
  },
};

export { UserDm };
