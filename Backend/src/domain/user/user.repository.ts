import {
  Db,
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRepository } from './interface/user.interface';
import { MongoDBRepo } from 'src/database/mongodb/mongodb.repository';
import { User } from './models/user.models';
import {
  ChangePasswordDto,
  UpdateUserDto,
  UserDto,
  UserMinimumDto,
} from './dto/user.dto';
import { AssessmentService } from 'src/domain/assessment/assessment.service';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MongoUserRepo extends MongoDBRepo implements IUserRepository {
  constructor(
    @Inject('MONGO_DB_CONN') db: Db,
    @Inject(forwardRef(() => AssessmentService))
    private readonly AssessmentService: AssessmentService,
  ) {
    super(db, 'user'); // collectionName
  }

  async getAll(): Promise<UserDto[]> {
    const users = await this.findMany({});
    if (!users) return [];
    return users.map((user) => {
      const { _id, ...rest } = user;
      return plainToInstance(
        UserDto,
        { id: _id.toString(), ...rest },
        { excludeExtraneousValues: true },
      );
    });
  }

  async findById(userId: string) {
    const user = await this.findOne({ _id: new ObjectId(userId) });
    if (!user) return null;
    const { _id, ...rest } = user;
    return plainToInstance(
      UserDto,
      { id: _id.toString(), ...rest },
      { excludeExtraneousValues: true },
    );
  }

  async findByUsername(username: string) {
    const user = await this.findOne({ username });
    if (!user) return null;
    const { _id, ...rest } = user;
    return plainToInstance(
      UserDto,
      { id: _id.toString(), ...rest },
      { excludeExtraneousValues: true },
    );
  }

  async changePassword(update: ChangePasswordDto): Promise<UpdateResult> {
    const { userId, oldPassword, newPassword, confirmNewPassword } = update;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new NotFoundException('User not found');

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    return await this.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: await bcrypt.hash(newPassword, 10) } },
    );
  }

  async createUser(user: User): Promise<InsertOneResult> {
    return await this.insertOne(user);
  }

  async updateUser(update: UpdateUserDto): Promise<UpdateResult> {
    const { id: userId, ...updateBody } = update;
    return await this.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateBody },
    );
  }

  async deleteUser(userId: string): Promise<DeleteResult> {
    (await this.AssessmentService.getAssessResult(userId)).map(async (res) => {
      if (res.id) await this.AssessmentService.deleteAssessResult(res.id);
    });
    return await this.deleteOne({ _id: new ObjectId(userId) });
  }

  async findByRole(role: string) {
    const users = await this.findMany({ role });
    if (!users) return [];
    return users.map((user) => {
      const { _id, ...rest } = user;
      return plainToInstance(
        UserMinimumDto,
        { id: _id.toString(), ...rest },
        { excludeExtraneousValues: true },
      );
    });
  }

  async getInChargeUsers(userId: string) {
    const user = await this.findOne({ _id: new ObjectId(userId) });
    if (!user) return [];
    if (user.role !== 'Student' && user.role !== 'Teacher')
      throw new BadRequestException('Invalid role');

    const findIdList =
      user.role === 'Teacher' ? user.studentsInCharge : user.teachersInCharge;
    if (!findIdList) return [];

    const users = await this.findMany({
      _id: { $in: findIdList.map((id: string) => new ObjectId(id)) },
    });
    if (!users || users.length === 0) return [];
    return users.map((user) => {
      const { _id, ...rest } = user;
      return plainToInstance(
        UserMinimumDto,
        { id: _id.toString(), ...rest },
        { excludeExtraneousValues: true },
      );
    });
  }

  async linkTeacher(studentId: string, teacherId: string) {
    const student = await this.findOne({ _id: new ObjectId(studentId) });
    if (!student) throw new NotFoundException('Student not found');

    const teacher = await this.findOne({ _id: new ObjectId(teacherId) });
    if (!teacher) throw new NotFoundException('Teacher not found');

    if (student.teachersInCharge?.includes(teacherId))
      throw new BadRequestException('Teacher already assigned to student');

    if (teacher.studentsInCharge?.includes(studentId))
      throw new BadRequestException('Student already assigned to teacher');

    const studentUpdRes = await this.updateOne(
      { _id: new ObjectId(teacherId) },
      { $addToSet: { studentsInCharge: studentId } },
    );

    if (studentUpdRes.modifiedCount) {
      return await this.updateOne(
        { _id: new ObjectId(studentId) },
        { $addToSet: { teachersInCharge: teacherId } },
      );
    } else return studentUpdRes;
  }

  async unlinkTeacher(studentId: string, teacherId: string) {
    const student = await this.findOne({ _id: new ObjectId(studentId) });
    if (!student) throw new NotFoundException('Student not found');

    const teacher = await this.findOne({ _id: new ObjectId(teacherId) });
    if (!teacher) throw new NotFoundException('Teacher not found');

    if (!student.teachersInCharge?.includes(teacherId))
      throw new BadRequestException('Teacher not assigned to student');

    if (!teacher.studentsInCharge?.includes(studentId))
      throw new BadRequestException('Student not assigned to teacher');

    const teacherUpdRes = await this.updateOne(
      { _id: new ObjectId(teacherId) },
      { $pull: { studentsInCharge: studentId } },
    );

    if (teacherUpdRes.modifiedCount) {
      return await this.updateOne(
        { _id: new ObjectId(studentId) },
        { $pull: { teachersInCharge: teacherId } },
      );
    } else return teacherUpdRes;
  }
}
