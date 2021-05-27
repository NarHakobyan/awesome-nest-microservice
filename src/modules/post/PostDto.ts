import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../dto/abstract.dto';
import type { PostEntity } from './post.entity';

export class PostDto extends AbstractDto {
  @ApiPropertyOptional()
  title: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional()
  userId: string;

  constructor(postEntity: PostEntity) {
    super(postEntity);
    this.title = postEntity.title;
    this.description = postEntity.description;
    this.userId = postEntity.userId;
  }
}
