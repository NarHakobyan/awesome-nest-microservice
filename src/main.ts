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

import { AppModule } from './app.module';
// import { QueryFailedFilter } from './filters/query-failed.filter';
import { ConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';

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

    const configService = app.select(SharedModule).get(ConfigService);

    const port = configService.getNumber('PORT');
    await app.listenAsync();

    console.info(`server running on port ${port}`);

    return app;
}

void bootstrap();
