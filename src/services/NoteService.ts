import { AppDataSource } from "../data-source";
import { Note } from "../entity";
import { NoteDTO } from "../dto";
import { Repository } from "typeorm";

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

  async createNote(note: Note) {
    return this.noteRepository.save(note);
  }

  async updateNote(noteData: NoteDTO) {
    const note = await this.noteRepository.findOne({
      where: { id: noteData.id },
    });
    note.title = noteData.title;
    note.content = noteData.content;
    note.tags = noteData.tags;

    return this.noteRepository.save(note);
  }

  async deleteNote(id: string) {
    const note = await this.noteRepository.findOne({
      where: { id },
    });

    return this.noteRepository.remove(note);
  }
}
