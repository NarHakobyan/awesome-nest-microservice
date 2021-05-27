import { Global, HttpModule, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { AwsS3Service } from './services/aws-s3.service';
import { ConfigService } from './services/config.service';
import { GeneratorService } from './services/generator.service';

const providers = [ConfigService, AwsS3Service, GeneratorService];

@Global()
@Module({
  providers,
  imports: [
    HttpModule,
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
  exports: [...providers, HttpModule, ElasticsearchModule],
})
export class SharedModule {}
