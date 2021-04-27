import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigService } from '../../shared/services/config.service';
import { PostRepository } from './post.repository';
import { PostSearchService } from './post-search.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PostRepository]),
        ElasticsearchModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                node: configService.get('ELASTICSEARCH_NODE'),
                auth: {
                    username: configService.get('ELASTICSEARCH_USERNAME'),
                    password: configService.get('ELASTICSEARCH_PASSWORD'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [PostSearchService],
    exports: [ElasticsearchModule, PostSearchService],
})
export class PostModule {}
