import { Hono } from "hono";
import { validator } from "hono/validator";
import UserPostgresRepositoryImpl from "./repository/postgres";
import UserService from "../domain/service";
import UserCommandUseCase from "../application/command/usecase";
import UserQueryUseCase from "../application/query/usecase";
import wrapper from "../../../core/utils/wrapper";

const userPostgresRepository = new UserPostgresRepositoryImpl();
const userService = new UserService(userPostgresRepository);
const userCommandUseCase = new UserCommandUseCase(userService);
const userQueryUseCase = new UserQueryUseCase(userService);

const user = new Hono();

user
  .get("", async (c) => {
    let page = c.req.query("page") ? parseInt(c.req.query("page")!) : 0;
    let size = c.req.query("size") ? parseInt(c.req.query("size")!) : 0;

    if (page <= 0 && size === 0) {
      page = 0;
      size = 0;
    } else {
      if (page <= 0) {
        page = 1;
      }
      if (size <= 0) {
        size = 10;
      }
    }

    let sort = c.req.query("sort") ? c.req.query("sort")!.toString() : "created_at";
    let order = c.req.query("order") ? c.req.query("order")!.toString() : "asc";

    sort = sort;
    order = order;

    const total = await userQueryUseCase.count();
    const users = await userQueryUseCase.findAll();
    const meta = {
      page: page,
      size: size,
      count: users.length,
      total: total,
      sort: sort,
      order: order,
    };
    const success = wrapper.pagination(200, meta, users);
    return c.json(success, 200);
  })
  .get(
    "/:id",
    validator("param", (value, c) => {
      if (!value.id) {
        const error = wrapper.error(400, "id is required");
        return c.json(error, 400);
      }
    }),
    async (c) => {
      const id = c.req.param("id");
      const user = await userQueryUseCase.findById(id);
      if (user === null) {
        const error = wrapper.error(404, "user not found");
        return c.json(error, 404);
      }
      const success = wrapper.detail(200, user);
      return c.json(success, 200);
    }
  )
  .get(
    "/email/:email",
    validator("param", (value, c) => {
      if (!value.email) {
        const error = wrapper.error(400, "email is required");
        return c.json(error, 400);
      }
    }),
    async (c) => {
      const email = c.req.param("email");
      const user = await userQueryUseCase.findByEmail(email);
      if (user === null) {
        const error = wrapper.error(404, "user not found");
        return c.json(error, 404);
      }
      const success = wrapper.detail(200, user);
      return c.json(success, 200);
    }
  )
  .post(
    "",
    validator("json", (value, c) => {
      if (!value.name) {
        const error = wrapper.error(400, "name is required");
        return c.json(error, 400);
      }
      if (!value.email) {
        const error = wrapper.error(400, "email is required");
        return c.json(error, 400);
      }
      if (!value.password) {
        const error = wrapper.error(400, "password is required");
        return c.json(error, 400);
      }
    }),
    async (c) => {
      const body = await c.req.json();
      const user = await userCommandUseCase.create(body);
      const success = wrapper.detail(201, user);
      return c.json(success, 201);
    }
  )
  .put(
    "/:id",
    validator("param", (value, c) => {
      if (!value.id) {
        const error = wrapper.error(400, "id is required");
        return c.json(error, 400);
      }
    }),
    validator("json", (value, c) => {
      if (!value.name) {
        const error = wrapper.error(400, "name is required");
        return c.json(error, 400);
      }
      if (!value.email) {
        const error = wrapper.error(400, "email is required");
        return c.json(error, 400);
      }
      if (!value.password) {
        const error = wrapper.error(400, "password is required");
        return c.json(error, 400);
      }
    }),
    async (c) => {
      const id = c.req.param("id");
      const body = await c.req.json();
      const user = await userCommandUseCase.update({ id, ...body });
      if (user === null) {
        const error = wrapper.error(404, "user not found");
        return c.json(error, 404);
      }
      const success = wrapper.detail(200, user);
      return c.json(success, 200);
    }
  )
  .delete(
    "/:id",
    validator("param", (value, c) => {
      if (!value.id) {
        const error = wrapper.error(400, "id is required");
        return c.json(error, 400);
      }
    }),
    async (c) => {
      const id = c.req.param("id");
      const user = await userCommandUseCase.remove({ id });
      if (user === null) {
        const error = wrapper.error(404, "user not found");
        return c.json(error, 404);
      }
      const success = wrapper.detail(204, user);
      return c.json(success, 204);
    }
  );

export default user;
