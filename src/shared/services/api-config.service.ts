import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { SnakeNamingStrategy } from '../../snake-naming.strategy';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  public getNumber(key: string): number {
    return Number(this.configService.get(key));
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    let entities = [__dirname + '/../../modules/**/*.entity{.ts,.js}'];
    let migrations = [__dirname + '/../../migrations/*{.ts,.js}'];

    if ((<any>module).hot) {
      const entityContext = (<any>require).context(
        './../../modules',
        true,
        /\.entity\.ts$/,
      );
      entities = entityContext.keys().map((id) => {
        const entityModule = entityContext(id);
        const [entity] = Object.values(entityModule);
        return entity;
      });
      const migrationContext = (<any>require).context(
        './../../migrations',
        false,
        /\.ts$/,
      );
      migrations = migrationContext.keys().map((id) => {
        const migrationModule = migrationContext(id);
        const [migration] = Object.values(migrationModule);
        return migration;
      });
    }
    return {
      entities,
      migrations,
      keepConnectionAlive: true,
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      subscribers: [],
      migrationsRun: true,
      logging: this.nodeEnv === 'development',
      namingStrategy: new SnakeNamingStrategy(),
    };
  }

  get awsS3Config() {
    return {
      accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>(
        'AWS_S3_SECRET_ACCESS_KEY',
      ),
      bucketRegion: this.configService.get<string>('AWS_S3_BUCKET_REGION'),
      bucketApiVersion: this.configService.get<string>('AWS_S3_API_VERSION'),
      bucketName: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
    };
  }
  get elasticConfig(): ElasticsearchModuleOptions {
    return {
      node: this.configService.get<string>('ELASTICSEARCH_NODE'),
      auth: {
        username: this.configService.get<string>('ELASTICSEARCH_USERNAME'),
        password: this.configService.get<string>('ELASTICSEARCH_PASSWORD'),
      },
    };
  }
}
