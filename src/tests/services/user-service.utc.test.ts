import { QueryFailedError, Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity";
import { UserService } from "../../services";
import { InternalServerError, UserExistsError } from "../../errors";
import { mock } from "jest-mock-extended";
import { Encrypt } from "../../utils";

const testUserId = "ce6dbf14-f5d8-4de0-95c9-25a76724248a";
const testUser: Partial<User> = {
  firstName: "Test",
  lastName: "User",
  password: "test-encrypted-pwd",
  username: "test.user",
  email: "test.user@fastdev.se",
  role: "user",
};
const testUserDto = {
  ...testUser,
  password: "test-pwd",
  fullName: `${testUser.firstName} ${testUser.lastName}`,
};

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
      const testUser = await service.getUser({ where: { id: testUserId } });

      expect(testUser).toEqual(testUser);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw and log error", async () => {
      repoSpy.findOne.mockRejectedValueOnce(new Error("Server error"));

      await expect(
        service.getUser({ where: { id: testUserId } })
      ).rejects.toThrow(new InternalServerError());
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
      repoSpy.save.mockResolvedValueOnce(testUser as User);
      await service.createUser(testUserDto);
      expect(repoSpy.save).toHaveBeenCalledWith(testUser);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(encryptPwdSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it("should throw already exists error", async () => {
      repoSpy.save.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-driver-error-duplicate key")
        )
      );

      await expect(service.createUser(testUserDto)).rejects.toThrow(
        new UserExistsError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(0);
      expect(repoSpy.save).toHaveBeenCalledWith(testUser);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(encryptPwdSpy).toHaveBeenCalledTimes(1);
    });

    it("should throw server error", async () => {
      repoSpy.save.mockRejectedValueOnce(
        new QueryFailedError(
          "test-create-query",
          ["test-param"],
          new Error("test-server-error")
        )
      );

      await expect(service.createUser(testUserDto)).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.save).toHaveBeenCalledWith(testUser);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(encryptPwdSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateUser", () => {
    it("should update user", async () => {
      testUserDto.id = testUserId;
      repoSpy.findOne.mockResolvedValueOnce(testUser as User);
      repoSpy.save.mockResolvedValueOnce(testUser as User);
      const updatedUser = await service.updateUser(testUserDto);

      expect(updatedUser).toEqual(testUser);
      expect(repoSpy.save).toHaveBeenCalledWith(testUser);
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testUserId },
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

      await expect(service.updateUser(testUserDto)).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testUserId },
      });
      expect(repoSpy.save).toHaveBeenCalledTimes(1);
      expect(repoSpy.save).toHaveBeenCalledWith(testUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete user", async () => {
      repoSpy.findOne.mockResolvedValueOnce(testUser as User);
      repoSpy.remove.mockResolvedValueOnce(testUser as User);
      const deletedUser = await service.deleteUser(testUserId);

      expect(deletedUser).toEqual(testUser);
      expect(repoSpy.remove).toHaveBeenCalledWith(testUser);
      expect(repoSpy.remove).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testUserId },
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

      await expect(service.deleteUser(testUserId)).rejects.toThrow(
        new InternalServerError()
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledTimes(1);
      expect(repoSpy.findOne).toHaveBeenCalledWith({
        where: { id: testUserId },
      });
      expect(repoSpy.remove).toHaveBeenCalledTimes(1);
      expect(repoSpy.remove).toHaveBeenCalledWith(testUser);
    });
  });
});
