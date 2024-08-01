import { Request, Response } from "express";
import * as cache from "memory-cache";
import { NoteService } from "../services";
import { NoteDTO } from "../dto";

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
      const notes = await NoteService.getInstance().getUserNotes(userId);
      cache.put("userNotes", notes, 10000);
      return res.status(200).json({
        data: notes,
      });
    }
  }

  static async searchUserNotes(req: Request, res: Response) {
    const { q } = req.query;
    const userId = req["currentUser"].id;
    const notes = await NoteService.getInstance().getUserNotesByKeyword(
      userId,
      q.toString()
    );
    return res.status(200).json({
      data: notes,
    });
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
      const note = await NoteService.getInstance().getNote(id);
      if (note) {
        cache.put(`note:${id}`, note, 10000);
        return res.status(200).json({
          data: note,
        });
      } else {
        return res.status(404).json({
          message: "Note not found.",
        });
      }
    }
  }

  static async createNote(req: Request, res: Response) {
    const userId = req["currentUser"].id;
    const { title, content, tags } = req.body;
    const noteDto = new NoteDTO();
    noteDto.title = title;
    noteDto.content = content;
    noteDto.tags = tags;
    noteDto.userId = userId;

    const noteId = await NoteService.getInstance().createNote(noteDto);
    return res.status(200).json({ id: noteId });
  }

  static async updateNote(req: Request, res: Response) {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const updatedNote = await NoteService.getInstance().updateNote({
      id,
      title,
      content,
      tags,
    });
    return res.status(200).json({ data: updatedNote });
  }

  static async deleteNote(req: Request, res: Response) {
    const { id } = req.params;
    await NoteService.getInstance().deleteNote(id);
    return res.status(200).json({ message: "Note deleted." });
  }
}
