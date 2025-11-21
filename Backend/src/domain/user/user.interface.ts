import { RefreshDto } from 'src/auth/dto/token.dto';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { User } from './models/user.models';

export interface IUserRepository {
  getUserPasswordByUsername(
    username: string,
  ): Promise<{ userId: string; password: string } | null>;
  findById(userId: string): Promise<UserDto | null>;
  findByUsername(username: string): Promise<UserDto | null>;
  changePassword(userId: string, update: object): Promise<any>;
  createUser(user: User): Promise<any>;
  updateUser(userId: string, update: UpdateUserDto | RefreshDto): Promise<any>;
  deleteUser(userId: string): Promise<any>;
}
