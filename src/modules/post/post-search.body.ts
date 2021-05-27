import { Field, Index, Primary } from '../elasticsearch/decorators';

@Index({ index: 'posts', settings: { numberOfShards: 3 } })
export class PostSearchBody {
  @Primary()
  @Field('keyword')
  id: string;

  @Field('keyword')
  title: string;

  @Field('text')
  description: string;

  @Field('keyword')
  userId: string;
}
