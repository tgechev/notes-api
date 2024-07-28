import { Request, Response } from "express";
import { UserService } from "../services";
import { Encrypt } from "../utils";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(500)
          .json({ message: "Email and password are required." });
      }

      const user = await UserService.getUser({ where: { email } });

      const invalidCredentialsResp = res
        .status(400)
        .json({ message: "Invalid email or password." });
      if (!user) {
        return invalidCredentialsResp;
      } else if (!Encrypt.comparePwd(user.password, password)) {
        return invalidCredentialsResp;
      }

      const token = Encrypt.generateToken(user.toDTO());

      return res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getUser(req: Request, res: Response) {
    if (!req[" currentUser"]) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserService.getUser({
      where: { id: req[" currentUser"].id },
    });
    return res.status(200).json({ ...user.toDTO() });
  }
}
