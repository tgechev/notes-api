import { QueryFailedError, Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity";
import { UserService } from "../../services";
import { InternalServerError, UserExistsError } from "../../errors";
import { mock } from "jest-mock-extended";
import { Encrypt } from "../../utils";

const testId = "ce6dbf14-f5d8-4de0-95c9-25a76724248a";
const testUser = new User();
testUser.id = testId;
testUser.firstName = "Test";
testUser.lastName = "User";
testUser.password = "test-encrypted-pwd";
testUser.username = "test.user";
testUser.email = "test.user@fastdev.se";
testUser.role = "user";

const errorSpy = jest.spyOn(console, "error");
const encryptPwdSpy = jest
  .spyOn(Encrypt, "encryptPwd")
  .mockResolvedValue("test-encrypted-pwd");
const repoSpy = mock<Repository<User>>();
jest.spyOn(AppDataSource, "getRepository").mockReturnValue(repoSpy);

describe("UserService", () => {
  let service: UserService;

  beforeAll(() => {
    service = UserService.getInstance();
  });

  describe("getUser", () => {
    it("should return user", async () => {
      const testUser = await service.getUser({ where: { id: testId } });

      expect(testUser).toEqual(testUser);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw and log error", async () => {
      repoSpy.findOne.mockRejectedValueOnce(new Error("Server error"));

      await expect(service.getUser({ where: { id: testId } })).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUsers", () => {
    it("should return users", async () => {
      repoSpy.find.mockResolvedValueOnce([testUser as User]);
      const testUsers = await service.getUsers();
      expect(testUsers).toEqual(testUsers);
      expect(repoSpy.find).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw and log error", async () => {
      repoSpy.find.mockRejectedValueOnce(new Error("Server error"));

      await expect(service.getUsers()).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("createUser", () => {
    it("should create user", async () => {
      const { id: userId, ...userToSave } = testUser;
      repoSpy.save.mockResolvedValueOnce(testUser as User);
      await service.createUser(testUser.toDTO());
      expect(repoSpy.save).toHaveBeenCalledWith(userToSave);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(encryptPwdSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw already exists error", async () => {
      const { id: userId, ...userToSave } = testUser;
      repoSpy.save.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-driver-error-duplicate key")
        )
      );

      await expect(service.createUser(testUser.toDTO())).rejects.toThrow(
        new UserExistsError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(0);
      expect(repoSpy.save).toHaveBeenCalledWith(userToSave);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(encryptPwdSpy).toHaveBeenCalledTimes(1);
    });

    it("should throw server error", async () => {
      const { id: userId, ...userToSave } = testUser;
      repoSpy.save.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-server-error")
        )
      );

      await expect(service.createUser(testUser.toDTO())).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.save).toHaveBeenCalledWith(userToSave);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(encryptPwdSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateUser", () => {
    it("should update user", async () => {
      repoSpy.findOne.mockResolvedValueOnce(testUser as User);
      repoSpy.save.mockResolvedValueOnce(testUser as User);
      const updatedUser = await service.updateUser(testUser.toDTO());

      expect(updatedUser).toEqual(testUser);
      expect(repoSpy.save).toHaveBeenCalledWith(testUser);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId },
      });
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw server error", async () => {
      repoSpy.findOne.mockResolvedValueOnce(testUser as User);
      repoSpy.save.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-server-error")
        )
      );

      await expect(service.updateUser(testUser.toDTO())).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId },
      });
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(repoSpy.save).toHaveBeenCalledWith(testUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete user", async () => {
      repoSpy.findOne.mockResolvedValueOnce(testUser as User);
      repoSpy.remove.mockResolvedValueOnce(testUser as User);
      const deletedUser = await service.deleteUser(testId);

      expect(deletedUser).toEqual(testUser);
      expect(repoSpy.remove).toHaveBeenCalledWith(testUser);
      expect(repoSpy.remove).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId },
      });
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw server error", async () => {
      repoSpy.findOne.mockResolvedValueOnce(testUser as User);
      repoSpy.remove.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-server-error")
        )
      );

      await expect(service.deleteUser(testId)).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testId },
      });
      expect(repoSpy.remove).toHaveBeenCalledTimes(1);
      expect(repoSpy.remove).toHaveBeenCalledWith(testUser);
    });
  });
});
