import { Request, Response } from "express";
import * as cache from "memory-cache";
import { NoteService } from "../services";
import { NoteDTO } from "../dto";
import { ApiRespBody } from "./api.response-body";

export class NoteController {
  static async getUserNotes(req: Request, res: Response<ApiRespBody>) {
    const data = cache.get("userNotes");
    if (data) {
      console.log("Serving cached user notes");
      return res.status(200).json({
        data,
      });
    } else {
      console.log("Serving user notes from DB");
      const userId = req["currentUser"].id;
      try {
        const notes = await NoteService.getInstance().getUserNotes(userId);
        cache.put("userNotes", notes, 10000);
        return res.status(200).json({
          data: notes,
        });
      } catch (error) {
        return res.status(500).json({ message: "Could not get user notes." });
      }
    }
  }

  static async searchUserNotes(req: Request, res: Response<ApiRespBody>) {
    const { q } = req.query;
    const userId = req["currentUser"].id;
    try {
      const notes = await NoteService.getInstance().getUserNotesByKeyword(
        userId,
        q.toString()
      );
      return res.status(200).json({
        data: notes,
      });
    } catch (error) {
      return res.status(500).json({ message: "Could not search notes." });
    }
  }

  static async getNote(req: Request, res: Response<ApiRespBody>) {
    const userId = req["currentUser"].id;
    const { id } = req.params;
    const data = cache.get(`note:${id}`);
    if (data) {
      console.log("Serving cached note");
      return res.status(200).json({
        data,
      });
    } else {
      console.log("Serving note from DB");
      try {
        const note = await NoteService.getInstance().getNote({ id, userId });
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
      } catch (error) {
        return res.status(500).json({ message: "Could not retrieve note." });
      }
    }
  }

  static async createNote(req: Request, res: Response<ApiRespBody>) {
    const userId = req["currentUser"].id;
    const { title, content, tags } = req.body;
    const noteDto = new NoteDTO();
    noteDto.title = title;
    noteDto.content = content;
    noteDto.tags = tags;
    noteDto.userId = userId;

    try {
      const noteId = await NoteService.getInstance().createNote(noteDto);
      return res.status(200).json({ data: { id: noteId } });
    } catch (error) {
      return res.status(500).json({ message: "Could not create note." });
    }
  }

  static async updateNote(req: Request, res: Response<ApiRespBody>) {
    const userId = req["currentUser"].id;
    const { id } = req.params;
    const { title, content, tags } = req.body;

    try {
      const updatedNote = await NoteService.getInstance().updateNote({
        id,
        title,
        content,
        tags,
        userId,
      });
      return res.status(200).json({ data: updatedNote });
    } catch (error) {
      return res.status(500).json({ message: "Could not update note." });
    }
  }

  static async deleteNote(req: Request, res: Response<ApiRespBody>) {
    const userId = req["currentUser"].id;
    const { id } = req.params;
    try {
      await NoteService.getInstance().deleteNote({ id, userId });
      return res.status(200).json({ message: "Note deleted." });
    } catch (error) {
      return res.status(500).json({ message: "Could not delete note." });
    }
  }
}
