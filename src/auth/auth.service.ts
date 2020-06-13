import { Injectable, ConflictException, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RedisService } from 'nestjs-redis';
import { MAX_ATTEMPTS, MAX_ATTEMPTS_EXCEEDED_PENALTY, TIME_INTERVAL } from '../../config';
import { MailerService } from '@nestjs-modules/mailer';
import { LoggerService } from 'src/logger/logger.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly mailer: MailerService,
    private readonly logger: LoggerService,
  ) {}

  async signup({ name, email, password }: SignupDto, ip: string) {
    const emailExists = await this.prisma.client.user.findOne({ where: { email } });

    if (emailExists) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.prisma.client.user.create({ data: { name, email, password: hashedPassword } });

    await this.logger.info(`New user: [${user.name}] - [${user.email}]`);

    const logins = await this.redis.getClient('logins');
    logins.incr(`${user.email}:logins`);
    logins.set(`${user.email}:lastIp`, ip);
    logins.set(`${user.email}:lastLogin`, Date.now());

    const { password: p, ...r } = user;

    return { ...r, logins: 1 };
  }

  async login({ email, password }: LoginDto, ip) {
    const loginAttempts = this.redis.getClient('loginAttempts');
    const bannedIps = this.redis.getClient('bannedIps');

    const attempts = parseInt((await loginAttempts.get(ip)) ?? '0');

    if ((await bannedIps.get(ip)) === 'true') {
      await bannedIps.set(ip, 'true', 'ex', MAX_ATTEMPTS_EXCEEDED_PENALTY);

      await this.logger.info(`Blocked login attempt from [${ip}]`);

      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    const user = await this.prisma.client.user.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    if (attempts > MAX_ATTEMPTS) {
      await bannedIps.set(ip, 'true', 'ex', MAX_ATTEMPTS_EXCEEDED_PENALTY);
      await loginAttempts.set(ip, 0);
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Failed login attempts on Todoify',
        text: `Unauthorized login attempts detected from ${ip}.`,
      });
      await this.logger.warn(`Banned [${ip}] for ${MAX_ATTEMPTS_EXCEEDED_PENALTY} seconds - Too many login attempts`);
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      await loginAttempts.multi().incr(ip).expire(ip, TIME_INTERVAL).exec();

      await this.logger.info(`Failed login attempt from [${ip}]`);

      throw new BadRequestException({
        attemptsLeft: MAX_ATTEMPTS - attempts,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Password is incorrect',
      });
    }

    await this.logger.info(`User [${user.name}] ([${user.email}]) logged in from [${ip}]`);

    const logins = await this.redis.getClient('logins');
    const lastIp = await logins.get(`${user.email}:lastIp`);
    const lastLogin = await logins.get(`${user.email}:lastLogin`);

    logins.incr(`${user.email}:logins`);
    logins.set(`${user.email}:lastIp`, ip);
    logins.set(`${user.email}:lastLogin`, Date.now());

    const { password: p, ...r } = user;

    return { ...r, logins: await logins.get(`${user.email}:logins`), lastIp, lastLogin };
  }

  async logout(user: User) {
    await this.logger.info(`User [${user.name}] ([${user.email}]) logged out`);
  }

  async validate({ id }) {
    const user = await this.prisma.client.user.findOne({ where: { id } });
    if (!user) {
      throw Error('Authentication validation error');
    }
    return user;
  }
}
