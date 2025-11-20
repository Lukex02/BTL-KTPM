import { Injectable } from '@nestjs/common';
import { MongoUserRepo } from './user.repository';
import { User } from './models/user.models';

@Injectable()
export class FindUserById {
  constructor(private readonly userRepo: MongoUserRepo) {}

  async execute(userId: string): Promise<User | null> {
    return await this.userRepo.findById(userId);
  }
}

@Injectable()
export class FindUserByUsername {
  constructor(private readonly userRepo: MongoUserRepo) {}

  async execute(username: string): Promise<User | null> {
    return await this.userRepo.findByUsername(username);
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
      return 'Error creating user';
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
      return 'Error updating user';
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
      return 'Error deleting user';
    }
  }
}
