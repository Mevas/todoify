import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/CurrentUser';
import { User } from '@prisma/client';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(@CurrentUser() user: User) {
    return this.tasksService.getTasks(user.id);
  }

  @Get('/:id')
  async getTask(@CurrentUser() user: User, @Param('id') id: number) {
    return this.tasksService.getTaskById(user.id, id);
  }
}
