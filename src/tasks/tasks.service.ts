import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { User } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService, private readonly logger: LoggerService) {}

  async getTasks(user: User) {
    return this.prisma.client.task.findMany({ where: { user } });
  }

  async getTaskById(user: User, taskId: number) {
    const task = (await this.prisma.client.user.findOne({ where: { id: user.id } }).tasks({ where: { id: taskId } }))[0];

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    return (await this.prisma.client.user.findOne({ where: { id: user.id } }).tasks({ where: { id: taskId } }))[0];
  }

  async createTask(user: User, body: string) {
    try {
      const task = await this.prisma.client.task.create({ data: { body, user: { connect: { id: user.id } } } });
      await this.logger.info(`User ${user.name} created a task (id [${task.id}], body [${body}])`);
      return task;
    } catch (e) {
      await this.logger.error(e);
    }
  }

  async updateTaskBody(user: User, taskId: number, body: string) {
    await this.checkIfTaskExists(user, taskId);

    try {
      const task = await this.prisma.client.task.update({ where: { id: taskId }, data: { body } });
      await this.logger.info(`User ${user.name} updated task [${task.id}] with a new body: [${body}]`);
      return task;
    } catch (e) {
      await this.logger.error(e);
    }
  }

  async updateTaskStatus(user: User, taskId: number, status: boolean) {
    await this.checkIfTaskExists(user, taskId);

    try {
      const task = await this.prisma.client.task.update({ where: { id: taskId }, data: { done: status } });
      await this.logger.info(`User ${user.name} updated task [${task.id}] with a new status: [${status ? 'done' : 'not done'}]`);
      return task;
    } catch (e) {
      await this.logger.error(e);
    }
  }

  async deleteTask(user: User, taskId: number) {
    await this.checkIfTaskExists(user, taskId);

    try {
      const task = await this.prisma.client.task.delete({ where: { id: taskId } });
      await this.logger.info(`User ${user.name} deleted task [${task.id}]`);
      return true;
    } catch (e) {
      await this.logger.error(e);
      return false;
    }
  }

  async checkIfTaskExists(user: User, taskId: number) {
    const task = (await this.prisma.client.user.findOne({ where: { id: user.id } }).tasks({ where: { id: taskId } }))[0];

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }
  }
}
