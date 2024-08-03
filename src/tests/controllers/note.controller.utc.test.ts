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
    noteServiceSpy.getUserNotesByKeyword.mockResolvedValue([testNote.toDTO()]);
    noteServiceSpy.getNote.mockResolvedValue(testNote.toDTO());
    noteServiceSpy.createNote.mockResolvedValue(testId);
    noteServiceSpy.updateNote.mockResolvedValue(testNote.toDTO());
  });

  describe("getUserNotes", () => {
    it("should return user notes from DB", async () => {
      const res = await request(app).get("/notes");

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: [testNote.toDTO()] });
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledWith(testId);
    });

    it("should return user notes from cache", async () => {
      cacheResp = [testNote.toDTO()];
      const res = await request(app).get("/notes");

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: [testNote.toDTO()] });
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledTimes(0);
    });

    it("should return error message", async () => {
      cacheResp = null;
      noteServiceSpy.getUserNotes.mockRejectedValueOnce(
        new InternalServerError()
      );
      const res = await request(app).get("/notes");

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ message: "Could not get user notes." });
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.getUserNotes).toHaveBeenCalledWith(testId);
    });
  });

  describe("searchUserNotes", () => {
    it("should return user notes", async () => {
      const res = await request(app).get("/notes/search?q=test");

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: [testNote.toDTO()] });
      expect(noteServiceSpy.getUserNotesByKeyword).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.getUserNotesByKeyword).toHaveBeenCalledWith(
        testId,
        "test"
      );
    });

    it("should return error message", async () => {
      noteServiceSpy.getUserNotesByKeyword.mockRejectedValueOnce(
        new InternalServerError()
      );
      const res = await request(app).get("/notes/search?q=test");

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ message: "Could not search notes." });
      expect(noteServiceSpy.getUserNotesByKeyword).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.getUserNotesByKeyword).toHaveBeenCalledWith(
        testId,
        "test"
      );
    });
  });

  describe("getNote", () => {
    it("should return note from DB", async () => {
      const res = await request(app).get(`/notes/${testId}`);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: testNote.toDTO() });
      expect(noteServiceSpy.getNote).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.getNote).toHaveBeenCalledWith({
        id: testId,
        userId: testId,
      });
    });

    it("should return note from cache", async () => {
      cacheResp = testNote.toDTO();
      const res = await request(app).get(`/notes/${testId}`);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: testNote.toDTO() });
      expect(noteServiceSpy.getNote).toHaveBeenCalledTimes(0);
    });

    it("should return not found message", async () => {
      cacheResp = null;
      noteServiceSpy.getNote.mockResolvedValueOnce(null);
      const res = await request(app).get(`/notes/${testId}`);

      expect(res.status).toEqual(404);
      expect(res.body).toEqual({ message: "Note not found." });
      expect(noteServiceSpy.getNote).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.getNote).toHaveBeenCalledWith({
        id: testId,
        userId: testId,
      });
    });

    it("should return error message", async () => {
      cacheResp = null;
      noteServiceSpy.getNote.mockRejectedValueOnce(new InternalServerError());
      const res = await request(app).get(`/notes/${testId}`);

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ message: "Could not retrieve note." });
      expect(noteServiceSpy.getNote).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.getNote).toHaveBeenCalledWith({
        id: testId,
        userId: testId,
      });
    });
  });

  describe("createNote", () => {
    it("should create note", async () => {
      const { id: noteId, ...noteToSave } = testNote.toDTO();
      const res = await request(app).post("/notes").send(testNote.toDTO());

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: { id: noteId } });
      expect(noteServiceSpy.createNote).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.createNote).toHaveBeenCalledWith(noteToSave);
    });

    it("should return error message", async () => {
      const { id: noteId, ...noteToSave } = testNote.toDTO();
      noteServiceSpy.createNote.mockRejectedValueOnce(
        new InternalServerError()
      );
      const res = await request(app).post("/notes").send(testNote.toDTO());

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ message: "Could not create note." });
      expect(noteServiceSpy.createNote).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.createNote).toHaveBeenCalledWith(noteToSave);
    });
  });

  describe("updateNote", () => {
    it("should update note", async () => {
      const res = await request(app)
        .put(`/notes/${testId}`)
        .send(testNote.toDTO());

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: testNote.toDTO() });
      expect(noteServiceSpy.updateNote).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.updateNote).toHaveBeenCalledWith(testNote.toDTO());
    });

    it("should return error message", async () => {
      noteServiceSpy.updateNote.mockRejectedValueOnce(
        new InternalServerError()
      );
      const res = await request(app)
        .put(`/notes/${testId}`)
        .send(testNote.toDTO());

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ message: "Could not update note." });
      expect(noteServiceSpy.updateNote).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.updateNote).toHaveBeenCalledWith(testNote.toDTO());
    });
  });

  describe("deleteNote", () => {
    it("should delete note", async () => {
      const res = await request(app).delete(`/notes/${testId}`);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: "Note deleted." });
      expect(noteServiceSpy.deleteNote).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.deleteNote).toHaveBeenCalledWith({
        id: testId,
        userId: testId,
      });
    });

    it("should return error message", async () => {
      noteServiceSpy.deleteNote.mockRejectedValueOnce(
        new InternalServerError()
      );
      const res = await request(app).delete(`/notes/${testId}`);

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ message: "Could not delete note." });
      expect(noteServiceSpy.deleteNote).toHaveBeenCalledTimes(1);
      expect(noteServiceSpy.deleteNote).toHaveBeenCalledWith({
        id: testId,
        userId: testId,
      });
    });
  });
});
