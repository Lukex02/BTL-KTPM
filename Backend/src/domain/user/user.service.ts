import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from './user.interface';
import { User } from './models/user.models';
import { ChangePasswordDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class FindUserById {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

@Injectable()
export class FindUserByUsername {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(username: string): Promise<User | null> {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

@Injectable()
export class ChangeUserPassword {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string, update: ChangePasswordDto): Promise<String> {
    const res = await this.userRepo.changePassword(userId, update);
    if (res.modifiedCount) {
      return 'Password changed';
    } else {
      throw new NotFoundException("Couldn't change password");
    }
  }
}

@Injectable()
export class CreateUser {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(user: User): Promise<String> {
    const res = await this.userRepo.createUser(user);
    if (res.insertedId) {
      return 'User created';
    } else {
      throw new NotFoundException("Couldn't create user");
    }
  }
}

@Injectable()
export class UpdateUser {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string, update: object): Promise<String> {
    const res = await this.userRepo.updateUser(userId, update);
    if (res.modifiedCount) {
      return 'User updated';
    } else {
      throw new NotFoundException("Couldn't update user");
    }
  }
}

@Injectable()
export class DeleteUser {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<String> {
    const res = await this.userRepo.deleteUser(userId);
    if (res.deletedCount) {
      return 'User deleted';
    } else {
      throw new NotFoundException("Couldn't delete user");
    }
  }
}

// Facade
@Injectable()
export class UserService {
  constructor(
    private readonly FindUserById: FindUserById,
    private readonly FindUserByUsername: FindUserByUsername,
    private readonly ChangeUserPassword: ChangeUserPassword,
    private readonly CreateUser: CreateUser,
    private readonly UpdateUser: UpdateUser,
    private readonly DeleteUser: DeleteUser,
  ) {}

  async findUserById(userId: string): Promise<User | null> {
    return await this.FindUserById.execute(userId);
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return await this.FindUserByUsername.execute(username);
  }

  async changeUserPassword(
    userId: string,
    update: ChangePasswordDto,
  ): Promise<String> {
    return await this.ChangeUserPassword.execute(userId, update);
  }

  async createUser(user: User): Promise<String> {
    return await this.CreateUser.execute(user);
  }

  async updateUser(userId: string, update: UpdateUserDto): Promise<String> {
    return await this.UpdateUser.execute(userId, update);
  }

  async deleteUser(userId: string): Promise<String> {
    return await this.DeleteUser.execute(userId);
  }
}
