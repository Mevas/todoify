import { Body, Controller, Ip, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/CurrentUser';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly jwt: JwtService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res() res: Response, @Ip() ip: string) {
    const user = await this.authService.signup(signupDto, ip);

    const jwt = this.jwt.sign({ id: user.id });
    res.cookie('token', jwt, { httpOnly: true });

    res.send(user);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Ip() ip: string, @Res() res: Response) {
    const user = await this.authService.login(loginDto, ip);

    const jwt = this.jwt.sign({ id: user.id });
    res.cookie('token', jwt, { httpOnly: true });

    res.send(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response, @CurrentUser() user: User) {
    await this.authService.logout(user);

    res.cookie('token', '', { httpOnly: true });
    res.sendStatus(200);
  }
}
