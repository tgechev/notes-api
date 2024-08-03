import * as express from "express";
import { authenticationHandler } from "../handlers";
import { NoteController } from "../controllers";

const Router = express.Router();

/**
 * @openapi
 * /notes:
 *   get:
 *     tags:
 *      - Notes
 *     summary: Returns all user notes.
 *     description: Returns all the notes for a logged in user. A valid JWT token is required.
 */
Router.get("/", authenticationHandler, NoteController.getUserNotes);

/**
 * @openapi
 * /notes/search:
 *   get:
 *     tags:
 *      - Notes
 *     summary: Searches user notes by provided keyword.
 *     description: Returns a list of user notes whose content and tags contain the provided keyword. A valid JWT token is required.
 */
Router.get("/search", authenticationHandler, NoteController.searchUserNotes);

/**
 * @openapi
 * /notes/:id:
 *   get:
 *     tags:
 *      - Notes
 *     summary: Returns a user note by id
 *     description: Returns a note belonging to the logged in user using the provided id. A valid JWT token is required.
 */
Router.get("/:id", authenticationHandler, NoteController.getNote);

/**
 * @openapi
 * /notes:
 *   post:
 *     tags:
 *      - Notes
 *     summary: Creates a user note.
 *     description: Creates a note for the logged in user. A valid JWT token and admin priviliges are required.
 */
Router.post("/", authenticationHandler, NoteController.createNote);

/**
 * @openapi
 * /notes:
 *   put:
 *     tags:
 *      - Notes
 *     summary: Updates a user note.
 *     description: Updates a note belonging to the logged in user. A valid JWT token is required.
 */
Router.put("/:id", authenticationHandler, NoteController.updateNote);

/**
 * @openapi
 * /notes:
 *   delete:
 *     tags:
 *      - Notes
 *     summary: Deletes a user note.
 *     description: Deletes a note belonging to the logged in user. A valid JWT token is required.
 */
Router.delete("/:id", authenticationHandler, NoteController.deleteNote);
export { Router as noteRouter };
