import { Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly jwt: JwtService) {}

  @Post('signup')
  async signup(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.signup(req.body.name, req.body.password);

    const jwt = this.jwt.sign({ id: user.id });
    res.cookie('token', jwt, { httpOnly: true });

    res.send(user);
  }

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.login(req.body.name, req.body.password);

    const jwt = this.jwt.sign({ id: user.id });
    res.cookie('token', jwt, { httpOnly: true });

    res.send(user);
  }
}
