import './boilerplate.polyfill';

import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { contextMiddleware } from './middlewares';
import { HealthCheckerModule } from './modules/health-checker/health-checker.module';
import { PostModule } from './modules/post/post.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    PostModule,
    HealthCheckerModule,
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.typeOrmConfig,
      inject: [ApiConfigService],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(contextMiddleware).forRoutes('*');
  }
}
