import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { NoteDTO } from "../dto";

@Entity({ name: "notes" })
export class Note {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: true })
  tags: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.notes, { nullable: false })
  user: User;

  public toDTO(): NoteDTO {
    const noteDto = new NoteDTO();
    noteDto.id = this.id;
    noteDto.title = this.title;
    noteDto.content = this.content;
    noteDto.tags = this.tags.split(", ");

    return noteDto;
  }
}
