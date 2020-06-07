import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare, hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(name: string, password: string) {
    const nameExists = await this.prisma.client.user.findOne({ where: { name } });

    if (nameExists) {
      throw new ConflictException('Username is already in use');
    }

    const hashedPassword = await hash(password, 10);

    return this.prisma.client.user.create({ data: { name, password: hashedPassword } });
  }

  async login(name: string, password: string) {
    const user = await this.prisma.client.user.findOne({ where: { name } });

    if (!user) {
      throw new NotFoundException('Username not found');
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
