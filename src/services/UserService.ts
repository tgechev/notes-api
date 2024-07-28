import { FindOneOptions } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entity";
import { Encrypt } from "../utils";
import { UserDTO } from "../dto";

export class UserService {
  static async getUser(options: FindOneOptions<User>) {
    const userRepository = AppDataSource.getRepository(User);
    return userRepository.findOne(options);
  }

  static async getUsers() {
    const userRepository = AppDataSource.getRepository(User);
    return userRepository.find();
  }

  static async createUser(userData: UserDTO) {
    const encryptedPassword = await Encrypt.encryptPwd(userData.password);
    const names = userData.fullName.split(" ");
    const user = new User();
    user.firstName = names[0];
    user.lastName = names[1];
    user.email = userData.email;
    user.password = encryptedPassword;
    user.role = userData.role;

    const userRepository = AppDataSource.getRepository(User);
    return userRepository.save(user);
  }

  static async updateUser(userData: UserDTO) {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
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
    return userRepository.save(user);
  }

  static async deleteUser(userId: string) {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    return userRepository.remove(user);
  }
}
