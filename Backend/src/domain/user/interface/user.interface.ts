import { RefreshDto } from 'src/auth/dto/token.dto';
import {
  ChangePasswordDto,
  UpdateUserDto,
  UserDto,
} from 'src/domain/user/dto/user.dto';
import { User } from 'src/domain/user/models/user.models';

export interface IUserRepository {
  getAll(): Promise<UserDto[]>;
  findById(userId: string): Promise<UserDto | null>;
  findByUsername(username: string): Promise<UserDto | null>;
  changePassword(update: ChangePasswordDto): Promise<any>;
  createUser(user: User): Promise<any>;
  updateUser(update: UpdateUserDto | RefreshDto): Promise<any>;
  deleteUser(userId: string): Promise<any>;
}
