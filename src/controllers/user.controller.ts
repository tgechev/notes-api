import { Request, Response } from "express";
import { UserService } from "../services";
import * as cache from "memory-cache";
import { UserExistsError } from "../errors";

export class UserController {
  static async register(req: Request, res: Response) {
    const { username, fullName, email, password, role } = req.body;
    try {
      await UserService.getInstance().createUser({
        username,
        fullName,
        email,
        password,
        role,
      });
    } catch (error: unknown) {
      if (error instanceof UserExistsError) {
        return res.status(409).json({ message: error.message });
      } else {
        return res.status(500).json({ message: "Could not create user." });
      }
    }

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
      try {
        const users = await UserService.getInstance().getUsers();
        cache.put("users", users, 6000);
        return res.status(200).json({
          data: users,
        });
      } catch (error) {
        return res.status(500).json({ message: "Could not retrieve users." });
      }
    }
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { fullName, email } = req.body;
    try {
      const updatedUser = await UserService.getInstance().updateUser({
        id,
        fullName,
        email,
      });
      res.status(200).json({ message: "update", user: updatedUser.toDTO() });
    } catch (error) {
      return res.status(500).json({ message: "Could not update user." });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await UserService.getInstance().deleteUser(id);
      res.status(200).json({ message: "ok" });
    } catch (error) {
      return res.status(500).json({ message: "Could not delete user." });
    }
  }
}
