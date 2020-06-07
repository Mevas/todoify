import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getTasks(userId: number) {
    return this.prisma.client.task.findMany({ where: { userId } });
  }

  async getTaskById(userId: number, taskId: number) {
    const task = (await this.prisma.client.user.findOne({ where: { id: userId } }).tasks({ where: { id: taskId } }))[0];

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    return (await this.prisma.client.user.findOne({ where: { id: userId } }).tasks({ where: { id: taskId } }))[0];
  }

  async createTask(userId: number, body: string) {
    return this.prisma.client.task.create({ data: { body, user: { connect: { id: userId } } } });
  }

  async updateTaskBody(userId: number, taskId: number, body: string) {
    await this.checkIfTaskExists(userId, taskId);

    return this.prisma.client.task.update({ where: { id: taskId }, data: { body } });
  }

  async updateTaskStatus(userId: number, taskId: number, status: boolean) {
    await this.checkIfTaskExists(userId, taskId);

    return this.prisma.client.task.update({ where: { id: taskId }, data: { done: status } });
  }

  async deleteTask(userId: number, taskId: number) {
    await this.checkIfTaskExists(userId, taskId);

    return this.prisma.client.task.delete({ where: { id: taskId } });
  }

  async checkIfTaskExists(userId: number, taskId: number) {
    const task = (await this.prisma.client.user.findOne({ where: { id: userId } }).tasks({ where: { id: taskId } }))[0];

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }
  }
}
