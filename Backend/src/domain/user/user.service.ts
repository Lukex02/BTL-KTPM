import { NotFoundException, Injectable } from '@nestjs/common';
import { MongoUserRepo } from './user.repository';
import { User } from './models/user.models';
import { ChangePasswordDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class FindUserById {
  constructor(private readonly userRepo: MongoUserRepo) {}

  async execute(userId: string): Promise<User | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

@Injectable()
export class FindUserByUsername {
  constructor(private readonly userRepo: MongoUserRepo) {}

  async execute(username: string): Promise<User | null> {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

@Injectable()
export class ChangeUserPassword {
  constructor(private readonly userRepo: MongoUserRepo) {}

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
  constructor(private readonly userRepo: MongoUserRepo) {}

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
  constructor(private readonly userRepo: MongoUserRepo) {}

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
  constructor(private readonly userRepo: MongoUserRepo) {}

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
    private readonly findUserById: FindUserById,
    private readonly findUserByUsername: FindUserByUsername,
    private readonly changeUserPassword: ChangeUserPassword,
    private readonly createUser: CreateUser,
    private readonly updateUser: UpdateUser,
    private readonly deleteUser: DeleteUser,
  ) {}

  async findById(userId: string): Promise<User | null> {
    return await this.findUserById.execute(userId);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.findUserByUsername.execute(username);
  }

  async changePassword(
    userId: string,
    update: ChangePasswordDto,
  ): Promise<String> {
    return await this.changeUserPassword.execute(userId, update);
  }

  async create(user: User): Promise<String> {
    return await this.createUser.execute(user);
  }

  async update(userId: string, update: UpdateUserDto): Promise<String> {
    return await this.updateUser.execute(userId, update);
  }

  async delete(userId: string): Promise<String> {
    return await this.deleteUser.execute(userId);
  }
}
