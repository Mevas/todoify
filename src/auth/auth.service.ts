import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcrypt';

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

  async validate({ id }) {
    const user = await this.prisma.client.user.findOne({ where: { id } });
    if (!user) {
      throw Error('Authentication validation error');
    }
    return user;
  }
}
