import * as express from "express";
import { authenticationHandler, authorizationHandler } from "../handlers";
import { AuthController, UserController } from "../controllers";
const Router = express.Router();

Router.get(
  "/users",
  authenticationHandler,
  authorizationHandler(["admin"]),
  UserController.getUsers
);
Router.get(
  "/user",
  authenticationHandler,
  authorizationHandler(["user", "admin"]),
  AuthController.getUser
);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a user
 *     description: Register a user in the system. As a minimum username and password should be provided for a successful registration.
 */
Router.post("/register", UserController.register);
Router.post("/login", AuthController.login);
Router.post("/logout", authenticationHandler, AuthController.logout);
Router.put(
  "/update/:id",
  authenticationHandler,
  authorizationHandler(["user", "admin"]),
  UserController.updateUser
);
Router.delete(
  "/delete/:id",
  authenticationHandler,
  authorizationHandler(["admin"]),
  UserController.deleteUser
);
export { Router as userRouter };
