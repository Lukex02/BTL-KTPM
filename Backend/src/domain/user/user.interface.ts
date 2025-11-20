import { User } from './models/user.models';

export interface IUserRepository {
  findById(userId: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  createUser(user: User): Promise<any>;
  updateUser(userId: string, update: object): Promise<any>;
  deleteUser(userId: string): Promise<any>;
}
