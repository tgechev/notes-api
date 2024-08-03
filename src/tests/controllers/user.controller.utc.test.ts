import * as request from "supertest";
import app from "../../index";
import { mock } from "jest-mock-extended";
import { UserService } from "../../services";
import { User } from "../../entity";
import { InternalServerError, UserExistsError } from "../../errors";

const testId = "ce6dbf14-f5d8-4de0-95c9-25a76724248a";
const testPwd = "test.password";
const testUsername = "test.user";
const testUser = new User();
testUser.id = testId;
testUser.password = testPwd;
testUser.username = testUsername;
testUser.firstName = "Test";
testUser.lastName = "User";
testUser.email = "test.user@fastdev.se";
testUser.role = "user";

jest.mock("../../handlers/authentication.handler", () => ({
  authenticationHandler: jest.fn((req, res, next) => {
    req["currentUser"] = { id: testId };
    next();
  }),
}));
jest.mock("../../handlers/authorization.handler", () => ({
  authorizationHandler: jest.fn((roles: string[]) => {
    return async (req, res, next) => {
      next();
    };
  }),
}));
jest.mock("../../services/user-service");

let cacheResp;
jest.mock("memory-cache", () => {
  return {
    get: jest.fn((key: string) => cacheResp),
    put: jest.fn((key: string) => cacheResp),
  };
});

const userServiceSpy = mock<UserService>();

describe("UserController", () => {
  beforeAll(() => {
    UserService.getInstance = () => userServiceSpy;
    userServiceSpy.getUsers.mockResolvedValue([testUser]);
    userServiceSpy.updateUser.mockResolvedValue(testUser);
    userServiceSpy.deleteUser.mockResolvedValue(testUser);
  });

  describe("register", () => {
    it("should register user", async () => {
      const { id: userId, ...userToSave } = testUser.toDTO();
      const res = await request(app)
        .post("/auth/register")
        .send({ ...testUser.toDTO(), password: testPwd });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: "User created." });
      expect(userServiceSpy.createUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.createUser).toHaveBeenCalledWith({
        ...userToSave,
        password: testPwd,
      });
    });

    it("should return error for missing username/password", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ ...testUser.toDTO() });

      expect(res.status).toEqual(400);
      expect(res.body).toEqual({
        message: "Username and password are required.",
      });
      expect(userServiceSpy.createUser).toHaveBeenCalledTimes(0);
    });

    it("should return error for existing user", async () => {
      const { id: userId, ...userToSave } = testUser.toDTO();
      userServiceSpy.createUser.mockRejectedValueOnce(new UserExistsError());
      const res = await request(app)
        .post("/auth/register")
        .send({ ...testUser.toDTO(), password: testPwd });

      expect(res.status).toEqual(409);
      expect(res.body).toEqual({
        message: "Username or email already exists.",
      });
      expect(userServiceSpy.createUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.createUser).toHaveBeenCalledWith({
        ...userToSave,
        password: testPwd,
      });
    });

    it("should return error for existing user", async () => {
      const { id: userId, ...userToSave } = testUser.toDTO();
      userServiceSpy.createUser.mockRejectedValueOnce(
        new InternalServerError()
      );
      const res = await request(app)
        .post("/auth/register")
        .send({ ...testUser.toDTO(), password: testPwd });

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({
        message: "Could not create user.",
      });
      expect(userServiceSpy.createUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.createUser).toHaveBeenCalledWith({
        ...userToSave,
        password: testPwd,
      });
    });
  });

  describe("getUsers", () => {
    it("should retrieve users from DB", async () => {
      const res = await request(app).get("/user/all");

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: [testUser] });
      expect(userServiceSpy.getUsers).toHaveBeenCalledTimes(1);
    });

    it("should retrieve users from cache", async () => {
      cacheResp = [testUser];
      const res = await request(app).get("/user/all");

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: [testUser] });
      expect(userServiceSpy.getUsers).toHaveBeenCalledTimes(0);
    });

    it("should return server error", async () => {
      cacheResp = null;
      userServiceSpy.getUsers.mockRejectedValueOnce(new InternalServerError());
      const res = await request(app).get("/user/all");

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({
        message: "Could not retrieve users.",
      });
      expect(userServiceSpy.getUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateUser", () => {
    it("should update user", async () => {
      const res = await request(app).put(`/user/${testId}`).send(testUser);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ data: testUser.toDTO() });
      expect(userServiceSpy.updateUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.updateUser).toHaveBeenCalledWith({
        id: testId,
        email: testUser.email,
      });
    });

    it("should return server error", async () => {
      userServiceSpy.updateUser.mockRejectedValueOnce(
        new InternalServerError()
      );
      const res = await request(app).put(`/user/${testId}`).send(testUser);

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({
        message: "Could not update user.",
      });
      expect(userServiceSpy.updateUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.updateUser).toHaveBeenCalledWith({
        id: testId,
        email: testUser.email,
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete user", async () => {
      const res = await request(app).delete(`/user/${testId}`);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: "User deleted." });
      expect(userServiceSpy.deleteUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(testId);
    });

    it("should return server error", async () => {
      userServiceSpy.deleteUser.mockRejectedValueOnce(
        new InternalServerError()
      );
      const res = await request(app).delete(`/user/${testId}`);

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({
        message: "Could not delete user.",
      });
      expect(userServiceSpy.deleteUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(testId);
    });
  });
});
