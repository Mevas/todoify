import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getTasks(userId: number) {
    return this.prisma.client.task.findMany({ where: { userId } });
  }

  async getTaskById(userId: number, taskId) {
    return this.prisma.client.user.findOne({ where: { id: userId } }).tasks({ where: { id: taskId } });
  }
}
