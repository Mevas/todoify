import { Inject, Injectable } from '@nestjs/common';
import { appendFile } from 'fs/promises';

const levels = {
  Debug: 0,
  Info: 1,
  Warning: 2,
  Error: 3,
};

@Injectable()
export class LoggerService {
  private readonly filename;
  private readonly level;

  constructor(@Inject('LOGGER_OPTIONS') private readonly options) {
    this.filename = options.filename;
    this.level = options.level;
  }

  async debug(message: string) {
    await this.write(message, 'Debug');
  }

  async info(message: string) {
    await this.write(message, 'Info');
  }

  async warn(message: string) {
    await this.write(message, 'Warning');
  }

  async error(message: string) {
    await this.write(message, 'Error');
  }

  private async write(message: string, level: string) {
    if (levels[level] < levels[this.level]) {
      return;
    }

    try {
      const datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

      await appendFile('app.log', `[${level}] [${datetime}] ${message}\n`);
    } catch (e) {
      console.error(e);
    }
  }
}
