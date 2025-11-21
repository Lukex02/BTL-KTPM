import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from 'src/domain/user/user.interface';
import { RefreshDto } from './dto/token.dto';
import { UserPayload } from './interface/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IUserRepository') private userRepository: IUserRepository,
  ) {}

  // ===== Validate username/password =====
  private async validateUser(
    username: string,
    password: string,
  ): Promise<string | null> {
    const user = await this.userRepository.getUserPasswordByUsername(username);
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    return user.userId;
  }

  // ===== Generate Access Token =====
  private async generateAccessToken(userId: string) {
    const payload: UserPayload = { userId, jti: crypto.randomUUID() };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'jwtAccessSecret',
      expiresIn: '15m', // Access token expire after 1 hour
    });
  }

  // ===== Generate Refresh Token =====
  private async generateRefreshToken(userId: string) {
    const payload: UserPayload = { userId, jti: crypto.randomUUID() };
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'jwtRefreshSecret',
      expiresIn: '7d', // Refresh token expire after 7 days
    });

    return refreshToken;
  }

  // ===== Register =====
  async register(username: string, password: string, role: string) {
    const user = await this.userRepository.findByUsername(username);
    if (user) throw new BadRequestException('Username already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.createUser({
      username,
      password: hashedPassword,
      role,
    });

    return { message: 'User created' };
  }

  // ===== Login =====
  async login(username: string, password: string) {
    const userId = await this.validateUser(username, password);
    if (!userId) throw new UnauthorizedException('Invalid credentials');

    const access_token = await this.generateAccessToken(userId);
    const refresh_token = await this.generateRefreshToken(userId);

    return { access_token, refresh_token };
  }

  verifyTokens(token: string, secret: string) {
    return this.jwtService.verify(token, { secret });
  }

  // ===== Refresh Token =====
  async refreshToken(user: RefreshDto & { userId: string }) {
    const verifyRF = await this.verifyTokens(
      user.refreshToken,
      process.env.JWT_REFRESH_SECRET || 'jwtRefreshSecret',
    );
    if (!verifyRF) throw new UnauthorizedException('Refresh token expired');
    const access_token = await this.generateAccessToken(user.userId);
    return { access_token };
  }
}
