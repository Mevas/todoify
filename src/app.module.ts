import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from 'nestjs-redis';
import { REDIS_BANNED_IPS_DB, REDIS_HOST, REDIS_LOGIN_ATTEMPTS_DB, REDIS_PASSWORD, REDIS_PORT } from '../config';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
