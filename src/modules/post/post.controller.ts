import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  NatsContext,
  Payload,
} from '@nestjs/microservices';

import { PostSearchDto } from './dto/PostSearchDto';
import { PostsService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(public postsService: PostsService) {}

  @MessagePattern('search')
  postsSearch(
    @Payload() postSearchDto: PostSearchDto,
    @Ctx() _context: NatsContext,
  ) {
    return this.postsService.search(postSearchDto.text);
  }
}
