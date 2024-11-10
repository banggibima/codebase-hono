import { Hono } from "hono";
import { logger } from "hono/logger";
import config from "./core/config/config";
import user from "./modules/user/infrastructure/handler";

const app = new Hono();

app.use(logger());
app.route("/api/users", user);

export default {
  port: config.app.port,
  fetch: app.fetch,
};
