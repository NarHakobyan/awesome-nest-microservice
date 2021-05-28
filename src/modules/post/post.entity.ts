import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../entities';
import { PostDto } from './PostDto';

@Entity({ name: 'posts' })
export class PostEntity extends AbstractEntity<PostDto> {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  userId: string;

  dtoClass = PostDto;
}
