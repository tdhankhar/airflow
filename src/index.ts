import "dotenv/config";
import initDb from "./db";
import initExecutor from "./executor";
import initScheduler from "./scheduler";
import initServices from "./services";

const init = async () => {
  await initDb();
  await initExecutor();
  await initScheduler();
  await initServices();
};

init();
