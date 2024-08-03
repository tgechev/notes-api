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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                example: test.user
 *              password:
 *                type: string
 *                example: test.user.password
 *              email:
 *                type: string
 *                example: test.user@fastdev.se
 *              fullName:
 *                type: string
 *                example: Test User
 *              role:
 *                type: string
 *                example: user
 *     responses:
 *       200:
 *         description: Successfully created user response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created.
 *       400:
 *         description: Error response for missing username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username and password are required.
 *       409:
 *         description: Error response for an existing user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username or email already exists.
 *       500:
 *         description: Error response for unsuccessfully created user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not create user.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                example: test.user
 *              password:
 *                type: string
 *                example: test.user.password
 *     responses:
 *       200:
 *         description: Successfully logged in user response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6IlRyZW5kYWZpbCBHZWNoZXYiLCJlbWFpbCI6InRyZW5kYWZpbC4xOTk3QGdtYWlsLmNvbSIsImlkIjoiYjRiNDdmODQtZGY0YS00YTc4LTkxMjQtNTMxNTBjZTg4YWY5Iiwicm9sZSI6InVzZXIiLCJ1c2VybmFtZSI6InRnZWNoZXYiLCJpYXQiOjE3MjI3MDA1OTUsImV4cCI6MTcyMjcyOTM5NX0.TE_mCrMkalFmC6BidQgcPTE-GY8Wdd3a_iXfmMg29Dg
 *       400:
 *         description: Error response for missing/invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     - Username and password are required.
 *                     - Invalid username or password.
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
Router.post("/login", AuthController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Auth
 *     summary: Logs out a user.
 *     description: Logs out a user. A valid JWT token is required.
 *     responses:
 *       200:
 *         description: Successfully logged out user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged out.
 *       401:
 *         description: Unauthorized response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 */
Router.post("/logout", authenticationHandler, AuthController.logout);
export { Router as authRouter };
