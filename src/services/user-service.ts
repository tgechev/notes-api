import { FindOneOptions, QueryFailedError, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entity";
import { Encrypt } from "../utils";
import { UserDTO } from "../dto";
import { UserExistsError, InternalServerError } from "../errors";

export class UserService {
  private static instance: UserService;
  private readonly userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }

    return UserService.instance;
  }

  async getUser(options: FindOneOptions<User>) {
    try {
      return await this.userRepository.findOne(options);
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }

  async getUsers() {
    try {
      const users = await this.userRepository.find();
      return users.map((user) => user.toDTO());
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }

  async createUser(userData: UserDTO) {
    const encryptedPassword = await Encrypt.encryptPwd(userData.password);
    const names = userData.fullName.split(" ");
    const user = new User();
    user.username = userData.username;
    user.firstName = names[0];
    user.lastName = names[1];
    user.email = userData.email;
    user.password = encryptedPassword;
    user.role = userData.role;

    try {
      await this.userRepository.save(user);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key")
      ) {
        throw new UserExistsError();
      } else {
        console.error(error);
        throw new InternalServerError();
      }
    }
  }

  async updateUser(userData: UserDTO) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userData.id },
      });
      if (userData.fullName) {
        const names = userData.fullName.split(" ");
        user.firstName = names[0];
        user.lastName = names[1];
      }
      if (userData.email) {
        user.email = userData.email;
      }
      return await this.userRepository.save(user);
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      return await this.userRepository.remove(user);
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerError();
    }
  }
}
