import { AppDataSource } from "../data-source";
import { Note } from "../entity";
import { NoteDTO } from "../dto";
import { Brackets, Repository } from "typeorm";
import { reduce, stringArrAcc } from "../utils";
import { UserService } from "./UserService";

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
    const notes = await this.noteRepository.find({
      where: { user: { id: userId } },
    });
    return notes.map((note) => note.toDTO());
  }

  async getUserNotesByKeyword(userId: string, keyword: string) {
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
  }

  async getNote(noteId: string) {
    const note = await this.noteRepository.findOne({ where: { id: noteId } });
    return note ? note.toDTO() : null;
  }

  async createNote(noteData: NoteDTO): Promise<string> {
    const note = new Note();
    note.title = noteData.title;
    note.content = noteData.content;
    if (noteData.tags) {
      note.tags = reduce(noteData.tags, stringArrAcc);
    }

    const currentUser = await UserService.getInstance().getUser({
      where: { id: noteData.userId },
      select: { id: true },
    });

    note.user = currentUser;
    const savedNote = await this.noteRepository.save(note);
    return savedNote.id;
  }

  async updateNote(noteData: NoteDTO) {
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
  }

  async deleteNote(id: string) {
    const note = await this.noteRepository.findOne({
      where: { id },
    });

    return this.noteRepository.remove(note);
  }
}
