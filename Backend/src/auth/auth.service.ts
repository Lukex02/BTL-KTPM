import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RefreshDto } from './dto/token.dto';
import { UserPayload } from './interface/user.interface';
import { UserDto } from 'src/domain/user/dto/user.dto';
import { UserService } from 'src/domain/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(UserService) private userService: UserService,
  ) {}

  // ===== Validate username/password =====
  private async validateUser(
    username: string,
    password: string,
  ): Promise<UserDto | null> {
    const user = await this.userService.findUserByUsername(username);
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    return user;
  }

  // ===== Generate Access Token =====
  private async generateAccessToken(user: UserPayload) {
    const payload: UserPayload = { ...user, jti: crypto.randomUUID() };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'jwtAccessSecret',
      expiresIn: '15m', // Access token expire after 1 hour
    });
  }

  // ===== Generate Refresh Token =====
  private async generateRefreshToken(user: UserPayload) {
    const payload: UserPayload = { ...user, jti: crypto.randomUUID() };
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'jwtRefreshSecret',
      expiresIn: '7d', // Refresh token expire after 7 days
    });

    return refreshToken;
  }

  // ===== Register =====
  async register(username: string, password: string, role: string) {
    try {
      const user = await this.userService.findUserByUsername(username);
      if (user) throw new BadRequestException('Username already exists');
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userService.createUser({
        username,
        password: hashedPassword,
        role,
      });

      return { message: 'User created' };
    }
  }

  // ===== Login =====
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user || !user.id || !user.role)
      throw new UnauthorizedException('Invalid credentials');
    const payload: UserPayload = { userId: user.id, role: user.role };

    const access_token = await this.generateAccessToken(payload);
    const refresh_token = await this.generateRefreshToken(payload);

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
    const payload: UserPayload = {
      userId: verifyRF.userId,
      role: verifyRF.role,
    };
    const access_token = await this.generateAccessToken(payload);
    return { access_token };
  }

  // ===== Check user role =====
  hasRole(user: any, requiredRoles: string[]): boolean {
    if (!user?.role) return false;
    return requiredRoles.some((role) => user.role.includes(role));
  }
}
