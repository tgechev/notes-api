import { User } from "../entity";
export class UserDTO {
  id?: string;
  username?: string;
  fullName?: string;
  email?: string;
  role?: string;
  password?: string;
}
