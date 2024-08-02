import * as express from "express";
import { authenticationHandler } from "../handlers";
import { AuthController, UserController } from "../controllers";
const Router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *      - Auth
 *     summary: Register a user
 *     description: Register a user in the system. As a minimum username and password should be provided for a successful registration.
 */
Router.post("/register", UserController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *      - Auth
 *     summary: Login a user
 *     description: Logs in a user. Username and password are required for a successful login.
 */
Router.post("/login", AuthController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *      - Auth
 *     summary: Logs out a user.
 *     description: Logs out a user. A valid JWT token is required.
 */
Router.post("/logout", authenticationHandler, AuthController.logout);
export { Router as authRouter };
