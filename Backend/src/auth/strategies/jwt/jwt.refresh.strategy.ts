import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET ?? 'jwtRefreshSecret',
      ignoreExpiration: false,
      passReqToCallback: true, // để lấy refresh token gốc
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.headers['authorization']?.split(' ')[1];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
