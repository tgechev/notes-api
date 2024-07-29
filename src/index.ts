import * as express from "express";
import * as path from "path";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import * as swaggerJSDoc from "swagger-jsdoc";
import * as swaggerUI from "swagger-ui-express";
import { AppDataSource } from "./data-source";
import { userRouter, noteRouter } from "./routes";
import { errorHandler } from "./handlers";
import "reflect-metadata";
dotenv.config();

const specOptions: swaggerJSDoc.OAS3Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Note Management API with Authentication",
      version: "1.0.0",
      description:
        "This is a Note management tool based on a REST API application running on an Express server",
      contact: {
        name: "Trendafil Gechev",
        email: "trendafil.1997@gmail.com",
      },
    },
    servers: [
      { url: "http://localhost:3000", description: "Development server" },
    ],
  },
  apis: [path.join(__dirname, "routes/*.routes.js")],
};

const spec = swaggerJSDoc(specOptions);

const app = express();

app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(spec));
app.use(express.json());
app.use(errorHandler);
const { PORT = 3000 } = process.env;
app.use("/auth", userRouter);
app.use("/notes", noteRouter);

app.get("/", (req: Request, res: Response) => {
  res.redirect("/api/docs");
});

AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
    console.log("Data connection initialized.");
  })
  .catch((error) => console.log(error));
