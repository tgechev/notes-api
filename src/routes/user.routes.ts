import * as express from "express";
import { authenticationHandler, authorizationHandler } from "../handlers";
import { AuthController, UserController } from "../controllers";
const Router = express.Router();

/**
 * @openapi
 * /user/all:
 *   get:
 *     tags:
 *      - Users
 *     summary: Returns information about all users.
 *     description: Returns information about all registered users. A valid JWT token and admin priviliges are required.
 */
Router.get(
  "/all",
  authenticationHandler,
  authorizationHandler(["admin"]),
  UserController.getUsers
);

/**
 * @openapi
 * /user:
 *   get:
 *     tags:
 *      - Users
 *     summary: Returns information about a logged in user.
 *     description: Returns information about the logged in user. A valid JWT token is required.
 */
Router.get(
  "/",
  authenticationHandler,
  authorizationHandler(["user", "admin"]),
  AuthController.getUser
);

/**
 * @openapi
 * /user/:id:
 *   put:
 *     tags:
 *      - Users
 *     summary: Updates a user by their id.
 *     description: Only admin users can update users by id. A valid JWT token is required.
 */
Router.put(
  "/:id",
  authenticationHandler,
  authorizationHandler(["admin"]),
  UserController.updateUser
);

/**
 * @openapi
 * /user/:id:
 *   delete:
 *     tags:
 *      - Users
 *     summary: Deletes a user by their id.
 *     description: Only admin users can delete users by id. A valid JWT token is required.
 */
Router.delete(
  "/:id",
  authenticationHandler,
  authorizationHandler(["admin"]),
  UserController.deleteUser
);
export { Router as userRouter };
