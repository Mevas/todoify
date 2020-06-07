import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JWT_SECRET } from 'config';
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload) {
    return this.authService.validate(payload);
  }
}
