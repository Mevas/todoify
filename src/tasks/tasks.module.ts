import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule.register({
      filename: 'app.log',
      level: 'Debug',
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
