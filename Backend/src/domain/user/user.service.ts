import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from './interface/user.interface';
import { User } from './models/user.models';
import {
  ChangePasswordDto,
  UpdateUserDto,
  UserDto,
  UserMinimumDto,
} from './dto/user.dto';
import { Command } from 'src/common/command';

@Injectable()
export class GetAll implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(): Promise<UserDto[]> {
    const users = await this.userRepo.getAll();
    if (!users) throw new NotFoundException('User not found');
    return users;
  }
}

@Injectable()
export class FindUserById implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

@Injectable()
export class FindUserByUsername implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(username: string): Promise<UserDto> {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

@Injectable()
export class ChangeUserPassword implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(update: ChangePasswordDto): Promise<string> {
    const res = await this.userRepo.changePassword(update);
    if (res.modifiedCount) {
      return 'Password changed successfully';
    } else {
      throw new NotFoundException("Couldn't change password");
    }
  }
}

@Injectable()
export class CreateUser implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(user: User): Promise<string> {
    const res = await this.userRepo.createUser(user);
    if (res.insertedId) {
      return 'User created';
    } else {
      throw new NotFoundException("Couldn't create user");
    }
  }
}

@Injectable()
export class UpdateUser implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(update: UpdateUserDto): Promise<string> {
    const res = await this.userRepo.updateUser(update);
    if (res.modifiedCount || res.matchedCount) {
      return 'User updated';
    } else {
      throw new NotFoundException("Couldn't update user");
    }
  }
}

@Injectable()
export class DeleteUser implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<string> {
    const res = await this.userRepo.deleteUser(userId);
    if (res.deletedCount) {
      return 'User deleted';
    } else {
      throw new NotFoundException("Couldn't delete user");
    }
  }
}

@Injectable()
export class FindUsersByRole implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(role: string): Promise<UserMinimumDto[]> {
    const users = await this.userRepo.findByRole(role);
    if (!users) throw new NotFoundException('User not found');
    return users;
  }
}

@Injectable()
export class GetInChargeUsers implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserMinimumDto[]> {
    const users = await this.userRepo.getInChargeUsers(userId);
    if (!users) throw new NotFoundException('User not found');
    return users;
  }
}

@Injectable()
export class LinkTeacher implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(studentId: string, teacherId: string): Promise<any> {
    return await this.userRepo.linkTeacher(studentId, teacherId);
  }
}

@Injectable()
export class UnlinkTeacher implements Command {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(studentId: string, teacherId: string): Promise<any> {
    return await this.userRepo.unlinkTeacher(studentId, teacherId);
  }
}

// Facade
@Injectable()
export class UserService {
  constructor(
    private readonly GetAll: GetAll,
    private readonly FindUserById: FindUserById,
    private readonly FindUserByUsername: FindUserByUsername,
    private readonly ChangeUserPassword: ChangeUserPassword,
    private readonly CreateUser: CreateUser,
    private readonly UpdateUser: UpdateUser,
    private readonly DeleteUser: DeleteUser,
    private readonly FindUsersByRole: FindUsersByRole,
    private readonly GetInChargeUsers: GetInChargeUsers,
    private readonly LinkTeacher: LinkTeacher,
    private readonly UnlinkTeacher: UnlinkTeacher,
  ) {}

  async getAll(): Promise<UserDto[]> {
    return await this.GetAll.execute();
  }

  async findUserById(userId: string): Promise<UserDto> {
    return await this.FindUserById.execute(userId);
  }

  async findUserByUsername(username: string): Promise<UserDto> {
    return await this.FindUserByUsername.execute(username);
  }

  async changeUserPassword(update: ChangePasswordDto): Promise<string> {
    return await this.ChangeUserPassword.execute(update);
  }

  async createUser(user: User): Promise<string> {
    return await this.CreateUser.execute(user);
  }

  async updateUser(update: UpdateUserDto): Promise<string> {
    return await this.UpdateUser.execute(update);
  }

  async deleteUser(userId: string): Promise<string> {
    return await this.DeleteUser.execute(userId);
  }

  async findUsersByRole(role: string): Promise<UserMinimumDto[]> {
    return await this.FindUsersByRole.execute(role);
  }

  async getInChargeUsers(userId: string): Promise<UserMinimumDto[]> {
    return await this.GetInChargeUsers.execute(userId);
  }

  async linkTeacher(studentId: string, teacherId: string): Promise<any> {
    return await this.LinkTeacher.execute(studentId, teacherId);
  }

  async unlinkTeacher(studentId: string, teacherId: string): Promise<any> {
    return await this.UnlinkTeacher.execute(studentId, teacherId);
  }
}
