import { AppDataSource } from "../data-source";
import { Note } from "../entity";
import { NoteDTO } from "../dto";
import { Repository } from "typeorm";
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
    return this.noteRepository.find({
      where: { user: { id: userId } },
    });
  }

  async getNote(noteId: string) {
    return this.noteRepository.findOne({ where: { id: noteId } });
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

    return this.noteRepository.save(note);
  }

  async deleteNote(id: string) {
    const note = await this.noteRepository.findOne({
      where: { id },
    });

    return this.noteRepository.remove(note);
  }
}
