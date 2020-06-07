import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule, TasksModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
