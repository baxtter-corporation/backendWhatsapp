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
    // Pass datasource URL from config to avoid Prisma throwing when env var is missing
    const dbUri = configService.get<any>('DATABASE')?.CONNECTION?.URI || undefined;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - PrismaClient accepts a `datasources` option at runtime
    super({ datasources: { db: { url: dbUri } } });
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
      this.logger.error('Repository:Prisma - connection error', err as any);
    }
  }

  public async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.warn('Repository:Prisma - OFF');
    } catch (err) {
      this.logger.warn('Repository:Prisma - disconnect error', err as any);
    }
  }
}
