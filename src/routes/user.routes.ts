import * as express from "express";
import { authenticationHandler, authorizationHandler } from "../handlers";
import { AuthController, UserController } from "../controllers";
const Router = express.Router();

/**
 * @openapi
 * /user/all:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Users
 *     summary: Returns information about all users.
 *     description: Returns information about all registered users. A valid JWT token and admin priviliges are required.
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       username:
 *                         type: string
 *                       role:
 *                         type: string
 *                   example:
 *                     - id: acf4285e-39b1-4c2a-806c-8250a08c37b0
 *                       fullName: Test User
 *                       username: test.user
 *                       email: test.user@fastdev.se
 *                       role: user
 *                       
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not retrieve users.
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
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Users
 *     summary: Returns information about a logged in user.
 *     description: Returns information about the logged in user. A valid JWT token is required.
 *     responses:
 *       200:
 *         description: The data of the currently logged in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                   example:
 *                       id: acf4285e-39b1-4c2a-806c-8250a08c37b0
 *                       fullName: Current User
 *                       username: current.user
 *                       email: current.user@fastdev.se
 *                       role: user
 *                       
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not retrieve user.
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
Router.get("/", authenticationHandler, AuthController.getUser);

/**
 * @openapi
 * /user/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Users
 *     summary: Updates a user by their id.
 *     description: Only admin users can update users by id. A valid JWT token is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Uuid of user to update
 *         schema:
 *           type: string
 *           example: 032d71f1-da08-434d-9056-11a9f61ccd24
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: new.current.user@fastdev.se
 *     responses:
 *       200:
 *         description: The data of the updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                   example:
 *                       id: acf4285e-39b1-4c2a-806c-8250a08c37b0
 *                       fullName: Current User
 *                       username: current.user
 *                       email: new.current.user@fastdev.se
 *                       role: user
 *                       
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not update user.
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
Router.put(
  "/:id",
  authenticationHandler,
  authorizationHandler(["admin"]),
  UserController.updateUser
);

/**
 * @openapi
 * /user/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Users
 *     summary: Deletes a user by their id.
 *     description: Only admin users can delete users by id. A valid JWT token is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Uuid of user to delete
 *         schema:
 *           type: string
 *           example: 032d71f1-da08-434d-9056-11a9f61ccd24
 *     responses:
 *       200:
 *         description: Confirmation message for deleted user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted.
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not delete user.
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
Router.delete(
  "/:id",
  authenticationHandler,
  authorizationHandler(["admin"]),
  UserController.deleteUser
);
export { Router as userRouter };
