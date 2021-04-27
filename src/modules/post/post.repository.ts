import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';

import { PostEntity } from './post.entity';

@EntityRepository(PostEntity)
export class PostRepository extends Repository<PostEntity> {}
