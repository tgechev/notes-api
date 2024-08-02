import { AppDataSource } from "../data-source";
import { Note } from "../entity";
import { NoteDTO } from "../dto";
import { Brackets, Repository } from "typeorm";
import { reduce, stringArrAcc } from "../utils";
import { UserService } from "./user-service";
import { InternalServerError } from "../errors";

export class NoteService {
  private static instance: NoteService;
  private readonly noteRepository: Repository<Note>;

  constructor() {
    this.noteRepository = AppDataSource.getRepository(Note);
  }

  static getInstance(): NoteService {
    if (!NoteService.instance) {
      NoteService.instance = new NoteService();
    }

    return NoteService.instance;
  }

  async getUserNotes(userId: string) {
    try {
      const notes = await this.noteRepository.find({
        where: { user: { id: userId } },
      });
      return notes.map((note) => note.toDTO());
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }

  async getUserNotesByKeyword(userId: string, keyword: string) {
    try {
      const notes = await this.noteRepository
        .createQueryBuilder()
        .where("Note.userId = :userId", { userId })
        .andWhere(
          new Brackets((qb) => {
            qb.where("LOWER(Note.content) LIKE LOWER(:keyword)", {
              keyword: `%${keyword}%`,
            }).orWhere("LOWER(Note.tags) LIKE LOWER(:keyword)", {
              keyword: `%${keyword}%`,
            });
          })
        )
        .getMany();
      return notes.map((note) => note.toDTO());
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }

  async getNote(noteId: string) {
    try {
      const note = await this.noteRepository.findOne({ where: { id: noteId } });
      return note ? note.toDTO() : null;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }

  async createNote(noteData: NoteDTO): Promise<string> {
    const note = new Note();
    note.title = noteData.title;
    note.content = noteData.content;
    if (noteData.tags) {
      note.tags = reduce(noteData.tags, stringArrAcc);
    }

    try {
      const currentUser = await UserService.getInstance().getUser({
        where: { id: noteData.userId },
        select: { id: true },
      });

      note.user = currentUser;
      const savedNote = await this.noteRepository.save(note);
      return savedNote.id;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }

  async updateNote(noteData: NoteDTO) {
    try {
      const note = await this.noteRepository.findOne({
        where: { id: noteData.id },
      });
      note.title = noteData.title;
      note.content = noteData.content;
      if (noteData.tags) {
        note.tags = reduce(noteData.tags, stringArrAcc);
      }

      await this.noteRepository.save(note);
      return noteData;
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }

  async deleteNote(id: string) {
    try {
      const note = await this.noteRepository.findOne({
        where: { id },
      });

      return await this.noteRepository.remove(note);
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }
}
