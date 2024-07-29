import { AppDataSource } from "../data-source";
import { Note } from "../entity";
import { NoteDTO } from "../dto";

export class NoteService {
  static async getUserNotes(userId: string) {
    const noteRepository = AppDataSource.getRepository(Note);
    return noteRepository.find({
      where: { user: { id: userId } },
    });
  }

  static async getNote(noteId: string) {
    const noteRepository = AppDataSource.getRepository(Note);
    return noteRepository.findOne({ where: { id: noteId } });
  }

  static async createNote(note: Note) {
    const noteRepository = AppDataSource.getRepository(Note);
    return noteRepository.save(note);
  }

  static async updateNote(noteData: NoteDTO) {
    const noteRepository = AppDataSource.getRepository(Note);
    const note = await noteRepository.findOne({
      where: { id: noteData.id },
    });
    note.title = noteData.title;
    note.content = noteData.content;
    note.tags = noteData.tags;

    return noteRepository.save(note);
  }

  static async deleteNote(id: string) {
    const noteRepository = AppDataSource.getRepository(Note);
    const note = await noteRepository.findOne({
      where: { id },
    });

    return noteRepository.remove(note);
  }
}
