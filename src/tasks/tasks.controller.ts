import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Post, Put, UseGuards } from '@nestjs/common';
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

  @Post()
  async createTask(@CurrentUser() user: User, @Body('body') body: string) {
    return this.tasksService.createTask(user.id, body);
  }

  @Put('/:id/body')
  async updateTaskBody(@CurrentUser() user: User, @Param('id') id: number, @Body('body') body: string) {
    return this.tasksService.updateTaskBody(user.id, id, body);
  }

  @Put('/:id/status')
  async updateTaskStatus(
    @CurrentUser() user: User,
    @Param('id') id: number,
    @Body('status', new ParseBoolPipe()) status: boolean,
  ) {
    return this.tasksService.updateTaskStatus(user.id, id, status);
  }

  @Delete('/:id')
  async deleteTask(@CurrentUser() user: User, @Param('id') id: number) {
    try {
      await this.tasksService.deleteTask(user.id, id);
      return true;
    } catch (e) {
      return false;
    }
  }
}
