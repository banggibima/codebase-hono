import redis from "redis";
import config from "../config/config";

const env = config.app.environment;
const host = config.redis.host;
const port = config.redis.port;
const password = config.redis.password;
const database = config.redis.database;

const url = `redis://${host}:${port}/${database}`;

const client =
  env === "production"
    ? redis.createClient({
        url: url,
        password: password,
        database: database,
        socket: {
          tls: true,
          rejectUnauthorized: false,
        },
      })
    : redis.createClient({
        url: url,
        password: password,
        database: database,
      });

export default client;
