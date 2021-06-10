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

  private getString(key: string, defaultValue?: string): string {
    console.log(key);
    return this.configService
      .get(key, defaultValue)
      .toString()
      .replace(/\\n/g, '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV', 'development');
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    let entities = [__dirname + '/../../modules/**/*.entity{.ts,.js}'];
    let migrations = [__dirname + '/../../migrations/*{.ts,.js}'];

    if (module.hot) {
      const entityContext = require.context(
        './../../modules',
        true,
        /\.entity\.ts$/,
      );
      entities = entityContext.keys().map((id) => {
        const entityModule = entityContext(id);
        const [entity] = Object.values(entityModule);
        return entity as string;
      });
      const migrationContext = require.context(
        './../../migrations',
        false,
        /\.ts$/,
      );
      migrations = migrationContext.keys().map((id) => {
        const migrationModule = migrationContext(id);
        const [migration] = Object.values(migrationModule);
        return migration as string;
      });
    }
    return {
      entities,
      migrations,
      keepConnectionAlive: true,
      type: 'postgres',
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      database: this.getString('DB_DATABASE'),
      subscribers: [],
      migrationsRun: true,
      logging: this.nodeEnv === 'development',
      namingStrategy: new SnakeNamingStrategy(),
    };
  }

  get awsS3Config() {
    return {
      bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
      bucketApiVersion: this.getString('AWS_S3_API_VERSION'),
      bucketName: this.getString('AWS_S3_BUCKET_NAME'),
    };
  }
  get elasticConfig(): ElasticsearchModuleOptions {
    return {
      node: this.getString('ELASTICSEARCH_NODE'),
      auth: {
        username: this.getString('ELASTICSEARCH_USERNAME'),
        password: this.getString('ELASTICSEARCH_PASSWORD'),
      },
    };
  }
}
