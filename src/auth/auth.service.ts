import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup({ name, email, password }: SignupDto) {
    const emailExists = await this.prisma.client.user.findOne({ where: { email } });

    if (emailExists) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await hash(password, 10);

    return this.prisma.client.user.create({ data: { name, email, password: hashedPassword } });
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.client.user.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new BadRequestException('Password is incorrect');
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
