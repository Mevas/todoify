import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from 'nestjs-redis';
import {
  EMAIL_HOST,
  EMAIL_HOST_PASSWORD,
  EMAIL_HOST_PORT,
  EMAIL_HOST_USER,
  REDIS_BANNED_IPS_DB,
  REDIS_HOST,
  REDIS_LOGIN_ATTEMPTS_DB,
  REDIS_PASSWORD,
  REDIS_PORT,
} from '../config';
import { MailerModule } from '@nestjs-modules/mailer';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TasksModule,
    PrismaModule,
    RedisModule.register([
      {
        name: 'loginAttempts',
        host: REDIS_HOST,
        port: REDIS_PORT,
        db: REDIS_LOGIN_ATTEMPTS_DB,
        password: REDIS_PASSWORD,
      },
      {
        name: 'bannedIps',
        host: REDIS_HOST,
        port: REDIS_PORT,
        db: REDIS_BANNED_IPS_DB,
        password: REDIS_PASSWORD,
      },
    ]),
    MailerModule.forRoot({
      transport: {
        host: EMAIL_HOST,
        port: EMAIL_HOST_PORT,
        secure: false,
        auth: {
          user: EMAIL_HOST_USER,
          pass: EMAIL_HOST_PASSWORD,
        },
      },
      defaults: {
        from: `Todoify <${EMAIL_HOST_USER}>`,
      },
    }),
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
