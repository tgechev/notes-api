import { Request, Response } from "express";
import { UserService } from "../services";
import { Encrypt } from "../utils";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(500)
          .json({ message: "Username and password are required." });
      }

      const user = await UserService.getUser({ where: { username } });

      if (!user || !Encrypt.comparePwd(user.password, password)) {
        return res
          .status(400)
          .json({ message: "Invalid username or password." });
      }

      const token = Encrypt.generateToken({ ...user.toDTO() });

      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getUser(req: Request, res: Response) {
    if (!req["currentUser"]) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserService.getUser({
      where: { id: req["currentUser"].id },
    });
    return res.status(200).json({ ...user.toDTO() });
  }
}
