import { Request, Response } from "express";
import * as cache from "memory-cache";
import { Note } from "../entity";
import { UserService, NoteService } from "../services";

export class NoteController {
  static async getUserNotes(req: Request, res: Response) {
    const data = cache.get("userNotes");
    if (data) {
      console.log("Serving cached user notes");
      return res.status(200).json({
        data,
      });
    } else {
      console.log("Serving user notes from DB");
      const userId = req["currentUser"].id;
      const notes = await NoteService.getUserNotes(userId);
      cache.put("userNotes", notes, 10000);
      return res.status(200).json({
        data: notes,
      });
    }
  }
  static async getNote(req: Request, res: Response) {
    const { id } = req.params;
    const data = cache.get(`note:${id}`);
    if (data) {
      console.log("Serving cached note");
      return res.status(200).json({
        data,
      });
    } else {
      console.log("Serving note from DB");
      const note = await NoteService.getNote(id);
      cache.put(`note:${id}`, note, 10000);
      return res.status(200).json({
        data: note,
      });
    }
  }
  static async createNote(req: Request, res: Response) {
    const userId = req["currentUser"].id;
    const { title, content, tags } = req.body;
    const note = new Note();
    note.title = title;
    note.content = content;
    note.tags = tags;

    const currentUser = await UserService.getUser({
      where: { id: userId },
      select: { id: true },
    });

    note.user = currentUser;
    const savedNote = await NoteService.createNote(note);
    return res.status(200).json({ id: savedNote.id });
  }

  static async updateNote(req: Request, res: Response) {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const updatedNote = await NoteService.updateNote({
      id,
      title,
      content,
      tags,
    });
    return res.status(200).json({ data: updatedNote });
  }

  static async deleteNote(req: Request, res: Response) {
    const { id } = req.params;
    await NoteService.deleteNote(id);
    return res.status(200).json({ message: "Note deleted." });
  }
}
