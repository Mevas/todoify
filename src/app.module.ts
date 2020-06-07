import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './users/users.controller';
import { TasksService } from './tasks/tasks.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [TasksService],
})
export class AppModule {}
