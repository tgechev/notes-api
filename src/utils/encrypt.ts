import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { UserDTO } from "../dto/user.dto";

dotenv.config();
const { JWT_SECRET = "" } = process.env;
export class Encrypt {
  static generateToken(payload: UserDTO) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
  }
  static async encryptPwd(password: string) {
    return bcrypt.hashSync(password, 10);
  }
  static comparePwd(hashPassword: string, password: string) {
    return bcrypt.compareSync(password, hashPassword);
  }
}
