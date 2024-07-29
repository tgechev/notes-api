import { Request, Response } from "express";
import { UserService } from "../services";
import { Encrypt } from "../utils";
import * as cache from "memory-cache";

export class UserController {
  static async register(req: Request, res: Response) {
    const { username, fullName, email, password, role } = req.body;
    await UserService.createUser({
      username,
      fullName,
      email,
      password,
      role,
    });

    return res.status(200).json({ message: "User created." });
  }

  static async getUsers(req: Request, res: Response) {
    const data = cache.get("users");
    if (data) {
      console.log("Serving cached users");
      return res.status(200).json({
        data,
      });
    } else {
      console.log("Serving users from DB");
      const users = await UserService.getUsers();

      cache.put("users", users, 6000);
      return res.status(200).json({
        data: users,
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { fullName, email } = req.body;
    const updatedUser = await UserService.updateUser({ id, fullName, email });

    res.status(200).json({ message: "update", user: updatedUser.toDTO() });
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    await UserService.deleteUser(id);
    res.status(200).json({ message: "ok" });
  }
}
