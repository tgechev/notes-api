import * as express from "express";
import { authenticationHandler } from "../handlers";
import { NoteController } from "../controllers";

const Router = express.Router();

Router.post("/", authenticationHandler, NoteController.createNote);
Router.get("/", authenticationHandler, NoteController.getUserNotes);

Router.get("/:id", authenticationHandler, NoteController.getNote);
Router.put("/:id", authenticationHandler, NoteController.updateNote);
Router.delete("/:id", authenticationHandler, NoteController.deleteNote);
export { Router as noteRouter };
