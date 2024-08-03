import * as express from "express";
import { authenticationHandler } from "../handlers";
import { NoteController } from "../controllers";

const Router = express.Router();

/**
 * @openapi
 * /notes:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Notes
 *     summary: Returns all user notes.
 *     description: Returns all the notes for a logged in user. A valid JWT token is required.
 *     responses:
 *       200:
 *         description: A list of user notes
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
 *                         type: uuid
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                   example:
 *                     - id: a2dc2442-2d59-4e8c-a7f6-92dadb456afd
 *                       title: My first note
 *                       content: My first note description
 *                       tags:
 *                         - first
 *                         - note
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not get user notes.
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
Router.get("/", authenticationHandler, NoteController.getUserNotes);

/**
 * @openapi
 * /notes/search:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Notes
 *     summary: Searches user notes by provided keyword.
 *     description: Returns a list of user notes whose content and tags contain the provided keyword. A valid JWT token is required.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: The keyword to search for in note content and tags
 *         schema:
 *           type: string
 *           example: demo
 *     responses:
 *       200:
 *         description: A list of matching user notes
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
 *                         type: uuid
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                   example:
 *                     - id: a2dc2442-2d59-4e8c-a7f6-92dadb456afd
 *                       title: My second note
 *                       content: My second note description
 *                       tags:
 *                         - second
 *                         - note
 *                         - match
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not search notes.
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
Router.get("/search", authenticationHandler, NoteController.searchUserNotes);

/**
 * @openapi
 * /notes/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Notes
 *     summary: Returns a user note by id
 *     description: Returns a note belonging to the logged in user using the provided id. A valid JWT token is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Uuid of note to retrieve
 *         schema:
 *           type: string
 *           example: a2dc2442-2d59-4e8c-a7f6-92dadb456afd
 *     responses:
 *       200:
 *         description: The requested user note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: uuid
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                   example:
 *                       id: a2dc2442-2d59-4e8c-a7f6-92dadb456afd
 *                       title: My second note
 *                       content: My second note description
 *                       tags:
 *                         - second
 *                         - note
 *                         - match
 *       404:
 *         description: Not found response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Note not found.
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not retrieve note.
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
Router.get("/:id", authenticationHandler, NoteController.getNote);

/**
 * @openapi
 * /notes:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Notes
 *     summary: Creates a user note.
 *     description: Creates a note for the logged in user. A valid JWT token and admin priviliges are required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                example: Test note
 *              content:
 *                type: string
 *                example: test note content
 *              tags:
 *                type: array
 *                items:
 *                  type: string
 *                example:
 *                  - test
 *                  - create
 *                  - tag
 *     responses:
 *       200:
 *         description: The id of the created user note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: uuid
 *                   example:
 *                     id: a2dc2442-2d59-4e8c-a7f6-92dadb456afd
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not create note.
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
Router.post("/", authenticationHandler, NoteController.createNote);

/**
 * @openapi
 * /notes/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Notes
 *     summary: Updates a user note.
 *     description: Updates a note belonging to the logged in user. A valid JWT token is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Uuid of note to update
 *         schema:
 *           type: string
 *           example: a2dc2442-2d59-4e8c-a7f6-92dadb456afd
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              content:
 *                type: string
 *                example: Updated note content
 *     responses:
 *       200:
 *         description: The updated user note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: uuid
 *                     content:
 *                       type: string
 *                     userId:
 *                       type: string
 *                   example:
 *                     id: a2dc2442-2d59-4e8c-a7f6-92dadb456afd
 *                     content: Updated note content
 *                     userId: b4b47f84-df4a-4a78-9124-53150ce88af9
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not update note.
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
Router.put("/:id", authenticationHandler, NoteController.updateNote);

/**
 * @openapi
 * /notes/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *      - Notes
 *     summary: Deletes a user note.
 *     description: Deletes a note belonging to the logged in user. A valid JWT token is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Uuid of note to delete
 *         schema:
 *           type: string
 *           example: a2dc2442-2d59-4e8c-a7f6-92dadb456afd
 *     responses:
 *       200:
 *         description: Confirmation message for deleted note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Note deleted.
 *       500:
 *         description: Server error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not delete note.
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
Router.delete("/:id", authenticationHandler, NoteController.deleteNote);
export { Router as noteRouter };
