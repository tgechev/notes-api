import { Request, Response } from "express";
import { UserService } from "../services";
import { Encrypt } from "../utils";
import * as cache from "memory-cache";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required." });
      }

      const user = await UserService.getInstance().getUser({
        where: { username },
      });

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
  static async logout(req: Request, res: Response) {
    const tokenExp = req["currentUser"].exp;
    const userId = req["currentUser"].id;
    const timeout = new Date(tokenExp * 1000).getTime() - new Date().getTime();

    cache.put(`logout:${userId}:${tokenExp}`, userId, timeout);
    return res.status(200).json({ message: "User logged out." });
  }

  static async getUser(req: Request, res: Response) {
    if (!req["currentUser"]) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await UserService.getInstance().getUser({
        where: { id: req["currentUser"].id },
      });
      return res.status(200).json(user.toDTO());
    } catch (error) {
      return res.status(500).json({ message: "Could not retrieve user." });
    }
  }
}
