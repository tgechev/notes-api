import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Note } from "./Note";
import { UserDTO } from "../dto";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: "user" })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  public toDTO(): UserDTO {
    const userDto = new UserDTO();
    userDto.fullName = `${this.firstName} ${this.lastName}`;
    userDto.email = this.email;
    userDto.id = this.id;
    userDto.role = this.role;
    userDto.username = this.username;

    return userDto;
  }
}
