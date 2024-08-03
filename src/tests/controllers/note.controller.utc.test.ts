import * as request from "supertest";
import app from "../../index";
import { mock } from "jest-mock-extended";
import { NoteService } from "../../services";
import { Note, User } from "../../entity";
import { InternalServerError } from "../../errors";

const testId = "ce6dbf14-f5d8-4de0-95c9-25a76724248a";
const testTags = "unit, test, tags";
const testUser = new User();
testUser.id = testId;

const testNote = new Note();
testNote.id = testId;
testNote.title = "Test";
testNote.content = "Unit test note";
testNote.tags = testTags;
testNote.user = testUser;

jest.mock("../../handlers/authentication.handler", () => ({
  authenticationHandler: jest.fn((req, res, next) => {
    req["currentUser"] = { id: testId };
    next();
  }),
}));
jest.mock("../../services/note-service");

let cacheResp;
jest.mock("memory-cache", () => {
  return {
    get: jest.fn((key: string) => cacheResp),
    put: jest.fn((key: string) => cacheResp),
  };
});

const noteServiceSpy = mock<NoteService>();

describe("NoteController", () => {
  beforeAll(() => {
    NoteService.getInstance = () => noteServiceSpy;
    noteServiceSpy.getUserNotes.mockResolvedValue([testNote.toDTO()]);
  });

  describe("getUserNotes", () => {
    it("should return user notes from DB", async () => {
      const res = await request(app).get("/notes");

      expect(res.body).toEqual({ data: [testNote.toDTO()] });
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledWith(testId);
    });

    it("should return user notes from cache", async () => {
      cacheResp = [testNote.toDTO()];
      const res = await request(app).get("/notes");

      expect(res.body).toEqual({ data: [testNote.toDTO()] });
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledTimes(0);
    });

    it("should return error message", async () => {
      cacheResp = null;
      noteServiceSpy.getUserNotes.mockRejectedValueOnce(
        new InternalServerError()
      );
      const res = await request(app).get("/notes");

      expect(res.body).toEqual({ message: "Could not get user notes." });
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledWith(testId);
    });
  });
});
