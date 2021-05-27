import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { PostSearchService } from './post-search.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostRepository])],
  controllers: [PostController],
  providers: [PostSearchService],
  exports: [PostSearchService],
})
export class PostModule {}
