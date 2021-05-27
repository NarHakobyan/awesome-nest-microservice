import type { INestMicroservice } from '@nestjs/common';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

import { name } from '../package.json';
import { AppModule } from './app.module';
import { RpcUnprocessableEntityException } from './exceptions';

export async function bootstrap(): Promise<INestMicroservice> {
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        // url: `nats://${process.env.NATS_HOST}:${process.env.NATS_PORT}`,
        url: 'nats://localhost:4222',
      },
    },
  );
  const reflector = app.get(Reflector);

  // app.useGlobalFilters(new QueryFailedFilter(reflector));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => new RpcUnprocessableEntityException(errors),
    }),
  );

  await app.listenAsync();

  console.info(`Microservice ${name} is up and running`);

  return app;
}

void bootstrap();
