import { QueryFailedError, Repository, SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Note, User } from "../../entity";
import { NoteService, UserService } from "../../services";
import { InternalServerError, UserExistsError } from "../../errors";
import { mock } from "jest-mock-extended";

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

const errorSpy = jest.spyOn(console, "error");
const repoSpy = mock<Repository<Note>>();
const qbSpy = mock<SelectQueryBuilder<Note>>();

jest.mock("../../services/user-service");
const userServiceSpy = mock<UserService>();
UserService.getInstance = () => userServiceSpy;
jest.spyOn(AppDataSource, "getRepository").mockReturnValue(repoSpy);

describe("NoteService", () => {
  let service: NoteService;

  beforeAll(() => {
    service = NoteService.getInstance();
    repoSpy.createQueryBuilder.mockReturnValue(qbSpy);
    qbSpy.where.mockReturnThis();
    qbSpy.andWhere.mockReturnThis();
    qbSpy.getMany.mockResolvedValue([testNote]);
    userServiceSpy.getUser.mockResolvedValue(testUser);
    repoSpy.findOne.mockResolvedValue(testNote);
    repoSpy.find.mockResolvedValue([testNote]);
    repoSpy.save.mockResolvedValue(testNote);
  });

  describe("getUserNotes", () => {
    it("should return user notes", async () => {
      const notes = await service.getUserNotes(testId);

      expect(notes).toEqual([testNote.toDTO()]);
      expect(repoSpy.find).toHaveBeenCalledTimes(1);
      expect(repoSpy.find).toHaveBeenCalledWith({
        where: { user: { id: testId } },
      });
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw and log error", async () => {
      repoSpy.find.mockRejectedValueOnce(new Error("Server error"));

      await expect(service.getUserNotes(testId)).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUserNotesByKeyword", () => {
    it("should return notes", async () => {
      const testNotes = await service.getUserNotesByKeyword(
        testId,
        "test-keyword"
      );

      expect(testNotes).toEqual([testNote.toDTO()]);
      expect(repoSpy.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(qbSpy.where).toHaveBeenCalledTimes(1);
      expect(qbSpy.andWhere).toHaveBeenCalledTimes(1);
      expect(qbSpy.getMany).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw and log error", async () => {
      qbSpy.getMany.mockRejectedValueOnce(new Error("Server error"));

      await expect(
        service.getUserNotesByKeyword(testId, "test-keyword")
      ).rejects.toThrow(new InternalServerError());

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(qbSpy.where).toHaveBeenCalledTimes(1);
      expect(qbSpy.andWhere).toHaveBeenCalledTimes(1);
      expect(qbSpy.getMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("getNote", () => {
    it("should retrieve note", async () => {
      const note = await service.getNote(testNote.toDTO());

      expect(note).toEqual(testNote.toDTO());
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId, user: { id: testId } },
      });
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should return null if note not found", async () => {
      repoSpy.findOne.mockResolvedValueOnce(null);
      const note = await service.getNote(testNote.toDTO());

      expect(note).toEqual(null);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId, user: { id: testId } },
      });
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw server error", async () => {
      repoSpy.findOne.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-server-error")
        )
      );

      await expect(service.getNote(testNote.toDTO())).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId, user: { id: testId } },
      });
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe("createNote", () => {
    it("should create note", async () => {
      const { id: testNoteId, ...testNoteToSave } = testNote;
      const noteId = await service.createNote({
        ...testNote.toDTO(),
        userId: testId,
      });

      expect(noteId).toEqual(testNoteId);
      expect(repoSpy.save).toHaveBeenCalledWith(testNoteToSave);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
      expect(userServiceSpy.getUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.getUser).toHaveBeenCalledWith({
        where: { id: testId },
        select: { id: true },
      });
    });

    it("should throw server error", async () => {
      repoSpy.save.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-server-error")
        )
      );
      const { id: testNoteId, ...testNoteToSave } = testNote;

      await expect(
        service.createNote({
          ...testNote.toDTO(),
          userId: testId,
        })
      ).rejects.toThrow(new InternalServerError());
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(repoSpy.save).toHaveBeenCalledWith(testNoteToSave);
      expect(userServiceSpy.getUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.getUser).toHaveBeenCalledWith({
        where: { id: testId },
        select: { id: true },
      });
    });
  });

  describe("updateNote", () => {
    it("should update note", async () => {
      const note = await service.updateNote(testNote.toDTO());

      expect(note).toEqual(testNote.toDTO());
      expect(repoSpy.save).toHaveBeenCalledWith(testNote);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId, user: { id: testId } },
      });
    });

    it("should throw server error", async () => {
      repoSpy.save.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-server-error")
        )
      );

      await expect(service.updateNote(testNote.toDTO())).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(repoSpy.save).toHaveBeenCalledWith(testNote);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId, user: { id: testId } },
      });
    });
  });

  describe("deleteNote", () => {
    it("should delete note", async () => {
      repoSpy.remove.mockResolvedValueOnce(testNote);
      const deletedNote = await service.deleteNote(testNote.toDTO());

      expect(deletedNote).toEqual(testNote);
      expect(repoSpy.remove).toHaveBeenCalledWith(testNote);
      expect(repoSpy.remove).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId, user: { id: testId } },
      });
    });

    it("should throw server error", async () => {
      repoSpy.remove.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-server-error")
        )
      );

      await expect(service.deleteNote(testNote.toDTO())).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.remove).toHaveBeenCalledTimes(1);
      expect(repoSpy.remove).toHaveBeenCalledWith(testNote);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId, user: { id: testId } },
      });
    });
  });
});
