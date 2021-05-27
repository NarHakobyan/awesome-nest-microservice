import type { INestMicroservice } from '@nestjs/common';
import {
    ClassSerializerInterceptor,
    HttpStatus,
    UnprocessableEntityException,
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

export async function bootstrap(): Promise<INestMicroservice> {
    initializeTransactionalContext();
    patchTypeORMRepositoryWithBaseRepository();
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.TCP,
            options: {
                port: Number(process.env.TRANSPORT_PORT),
                retryAttempts: 5,
                retryDelay: 3000,
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
            exceptionFactory: (errors) =>
                new UnprocessableEntityException(errors),
        }),
    );

    await app.listenAsync();

    console.info(`Microservice ${name} is up and running`);

    return app;
}

void bootstrap();
