import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from '../../config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RedisModule } from 'nestjs-redis';
import { MailerModule } from '@nestjs-modules/mailer';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: `${3600 * 24 * 7}s` },
    }),
    RedisModule,
    MailerModule,
    LoggerModule.register({
      filename: 'app.log',
      level: 'Debug',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
