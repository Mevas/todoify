import { Injectable, ConflictException, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RedisService } from 'nestjs-redis';
import { MAX_ATTEMPTS, MAX_ATTEMPTS_EXCEEDED_PENALTY, TIME_INTERVAL } from '../../config';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly redisService: RedisService) {}

  async signup({ name, email, password }: SignupDto) {
    const emailExists = await this.prisma.client.user.findOne({ where: { email } });

    if (emailExists) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await hash(password, 10);

    return this.prisma.client.user.create({ data: { name, email, password: hashedPassword } });
  }

  async login({ email, password }: LoginDto, ip) {
    const loginAttempts = this.redisService.getClient('loginAttempts');
    const bannedIps = this.redisService.getClient('bannedIps');

    const attempts = parseInt(await loginAttempts.get(ip)) ?? 0;

    if ((await bannedIps.get(ip)) === 'true') {
      await bannedIps.set(ip, 'true', 'ex', MAX_ATTEMPTS_EXCEEDED_PENALTY);
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    if (attempts >= MAX_ATTEMPTS) {
      await bannedIps.set(ip, 'true', 'ex', MAX_ATTEMPTS_EXCEEDED_PENALTY);
      await loginAttempts.set(ip, 0);
    }

    const user = await this.prisma.client.user.findOne({ where: { email } });

    if (!user) {
      await loginAttempts.multi().incr(ip).expire(ip, TIME_INTERVAL).exec();

      throw new NotFoundException({
        attemptsLeft: MAX_ATTEMPTS - attempts,
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Email not found',
      });
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      await loginAttempts.multi().incr(ip).expire(ip, TIME_INTERVAL).exec();

      throw new BadRequestException({
        attemptsLeft: MAX_ATTEMPTS - attempts,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Password is incorrect',
      });
    }

    return user;
  }

  async validate({ id }) {
    const user = await this.prisma.client.user.findOne({ where: { id } });
    if (!user) {
      throw Error('Authentication validation error');
    }
    return user;
  }
}
