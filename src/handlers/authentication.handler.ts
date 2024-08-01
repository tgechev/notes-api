import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import * as cache from "memory-cache";
dotenv.config();

export const authenticationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  if (!decode) {
    return res.status(401).json({ message: "Unauthorized" });
  } else if (cache.get(`logout:${decode["id"]}:${decode["exp"]}`)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req["currentUser"] = decode;
  next();
};
