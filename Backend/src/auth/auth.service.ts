import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './interface/user.interface';
import * as bcrypt from 'bcrypt';
import { Db, ObjectId } from 'mongodb';
import type { IUserRepository } from 'src/domain/user/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IUserRepository') private userRepository: IUserRepository,
  ) {}

  // ===== Register =====
  async register(username: string, password: string, role: string) {
    const user = await this.userRepository.findByUsername(username);
    if (user) throw new BadRequestException('Username already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.createUser({
      id: new ObjectId().toString(),
      username,
      password: hashedPassword,
      role,
    });

    return { message: 'User created' };
  }

  // ===== Validate username/password =====
  async validateUser(
    username: string,
    password: string,
  ): Promise<UserPayload | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    return { userId: user.id, username: user.username, role: user.role };
  }

  // ===== Generate Access Token =====
  async generateAccessToken(user: UserPayload) {
    const payload = {
      sub: user.userId,
      username: user.username,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'jwtAccessSecret',
      expiresIn: '1h',
    });
  }

  // ===== Generate Refresh Token =====
  async generateRefreshToken(user: UserPayload) {
    const payload = { sub: user.userId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'jwtRefreshSecret',
      expiresIn: '7d',
    });

    // Lưu hash refresh token vào DB
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.updateUser(user.userId, {
      $set: { refreshToken: hashedToken },
    });

    return refreshToken;
  }

  // ===== Login =====
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const access_token = await this.generateAccessToken(user);
    const refresh_token = await this.generateRefreshToken(user);

    return { access_token, refresh_token };
  }

  // ===== Refresh Tokens =====
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Refresh token not found');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const payload: UserPayload = {
      userId,
      username: user.username,
      role: user.role,
    };
    const access_token = await this.generateAccessToken(payload);
    const new_refresh_token = await this.generateRefreshToken(payload); // Rotate token

    return { access_token, refresh_token: new_refresh_token };
  }

  // ===== Logout =====
  async logout(userId: string) {
    await this.userRepository.updateUser(userId, {
      $unset: { refreshToken: '' },
    });
    return { message: 'Logged out' };
  }
}
