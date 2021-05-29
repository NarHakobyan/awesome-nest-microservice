import { Global, HttpModule, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { ApiConfigService } from './services/api-config.service';
import { AwsS3Service } from './services/aws-s3.service';
import { GeneratorService } from './services/generator.service';

const providers = [ApiConfigService, AwsS3Service, GeneratorService];

@Global()
@Module({
  providers,
  imports: [
    HttpModule,
    ElasticsearchModule.registerAsync({
      useFactory: (configService: ApiConfigService) =>
        configService.elasticConfig,
      inject: [ApiConfigService],
    }),
  ],
  exports: [...providers, HttpModule, ElasticsearchModule],
})
export class SharedModule {}
