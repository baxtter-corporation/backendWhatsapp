import { ConfigService } from '@config/env.config';
import { Logger } from '@config/logger.config';
import { PrismaClient } from '@prisma/client';

export class Query<T> {
  where?: T;
  sort?: 'asc' | 'desc';
  page?: number;
  offset?: number;
}

export class PrismaRepository extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    // If DATABASE_CONNECTION_URI is missing at build/runtime, set it from config
    // before instantiating PrismaClient to avoid runtime P1012 errors.
    const dbUri = configService.get<any>('DATABASE')?.CONNECTION?.URI;
    if (dbUri) {
      process.env.DATABASE_CONNECTION_URI = dbUri;
    }

    super();
  }

  private readonly logger = new Logger('PrismaRepository');

  public async onModuleInit() {
    const dbUri = this.configService.get<any>('DATABASE')?.CONNECTION?.URI;
    if (!dbUri) {
      this.logger.warn('Repository:Prisma - DATABASE_CONNECTION_URI not set, skipping Prisma connection');
      return;
    }

    try {
      await this.$connect();
      this.logger.info('Repository:Prisma - ON');
    } catch (err) {
      this.logger.error({ message: 'Repository:Prisma - connection error', error: err as any });
    }
  }

  public async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.warn('Repository:Prisma - OFF');
    } catch (err) {
      this.logger.warn({ message: 'Repository:Prisma - disconnect error', error: err as any });
    }
  }
}
