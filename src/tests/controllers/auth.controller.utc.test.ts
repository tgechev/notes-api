import * as request from "supertest";
import app from "../../index";
import { mock } from "jest-mock-extended";
import { UserService } from "../../services";
import { User } from "../../entity";
import { InternalServerError } from "../../errors";
import { Encrypt } from "../../utils/encrypt";

const testId = "ce6dbf14-f5d8-4de0-95c9-25a76724248a";
const testPwd = "test.password";
const testUsername = "test.user";
const testUser = new User();
testUser.id = testId;
testUser.password = testPwd;
testUser.username = testUsername;

let currentUser = { id: testId, exp: 123456789 };

jest.mock("../../handlers/authentication.handler", () => ({
  authenticationHandler: jest.fn((req, res, next) => {
    req["currentUser"] = currentUser;
    next();
  }),
}));
jest.mock("../../services/user-service");
const userServiceSpy = mock<UserService>();

jest.mock("../../utils/encrypt");
const generateTokenSpy = jest.spyOn(Encrypt, "generateToken");
const comparePwdSpy = jest.spyOn(Encrypt, "comparePwd");

let cacheResp;
jest.mock("memory-cache", () => {
  return {
    get: jest.fn((key: string) => cacheResp),
    put: jest.fn((key: string) => cacheResp),
  };
});

describe("AuthController", () => {
  beforeAll(() => {
    UserService.getInstance = () => userServiceSpy;
    userServiceSpy.getUser.mockResolvedValue(testUser);
    generateTokenSpy.mockReturnValue("test-token");
    comparePwdSpy.mockReturnValue(true);
  });

  describe("login", () => {
    it("should login user", async () => {
      const res = await request(app)
        .post(`/auth/login`)
        .send({ username: testUsername, password: testPwd });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ token: "test-token" });
      expect(userServiceSpy.getUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.getUser).toHaveBeenCalledWith({
        where: { username: testUsername },
      });
      expect(generateTokenSpy).toHaveBeenCalledTimes(1);
      expect(generateTokenSpy).toHaveBeenCalledWith(testUser.toDTO());
      expect(comparePwdSpy).toHaveBeenCalledTimes(1);
      expect(comparePwdSpy).toHaveBeenCalledWith(testPwd, testPwd);
    });

    it("should return error for missing username/password", async () => {
      const res = await request(app)
        .post(`/auth/login`)
        .send({ username: "test.user" });

      expect(res.status).toEqual(400);
      expect(res.body).toEqual({
        message: "Username and password are required.",
      });
      expect(generateTokenSpy).toHaveBeenCalledTimes(0);
      expect(comparePwdSpy).toHaveBeenCalledTimes(0);
    });

    it("should return error for invalid username/password", async () => {
      comparePwdSpy.mockReturnValueOnce(false);
      const res = await request(app)
        .post(`/auth/login`)
        .send({ username: testUsername, password: testPwd });

      expect(res.status).toEqual(400);
      expect(res.body).toEqual({
        message: "Invalid username or password.",
      });
      expect(userServiceSpy.getUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.getUser).toHaveBeenCalledWith({
        where: { username: testUsername },
      });
      expect(generateTokenSpy).toHaveBeenCalledTimes(0);
      expect(comparePwdSpy).toHaveBeenCalledTimes(1);
    });

    it("should return error message", async () => {
      userServiceSpy.getUser.mockRejectedValueOnce(new InternalServerError());
      const res = await request(app)
        .post(`/auth/login`)
        .send({ username: testUsername, password: testPwd });

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ message: "Internal server error" });
      expect(userServiceSpy.getUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.getUser).toHaveBeenCalledWith({
        where: { username: testUsername },
      });
    });
  });

  describe("logout", () => {
    it("should logout user", async () => {
      const res = await request(app).post(`/auth/logout`);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: "User logged out." });
    });
  });

  describe("getUser", () => {
    it("should return current user", async () => {
      const res = await request(app).get(`/user`);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(testUser.toDTO());
    });

    it("should return unauthorized error", async () => {
      currentUser = null;
      const res = await request(app).get(`/user`);

      expect(res.status).toEqual(401);
      expect(res.body).toEqual({ message: "Unauthorized" });
    });

    it("should return error message", async () => {
      currentUser = { id: testId, exp: 123456789 };
      userServiceSpy.getUser.mockRejectedValueOnce(new InternalServerError());
      const res = await request(app).get(`/user`);

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ message: "Could not retrieve user." });
      expect(userServiceSpy.getUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.getUser).toHaveBeenCalledWith({
        where: { id: testId },
      });
    });
  });
});
