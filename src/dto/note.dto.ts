import { Note } from "../entity";
export class NoteDTO {
  id?: string;
  title?: string;
  content?: string;
  tags?: string[];
  userId?: string;
}
