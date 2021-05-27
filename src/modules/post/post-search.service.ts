import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import type { IElasticResult } from '../../interfaces/IElasticResult';
import {
  getIndexMetadata,
  getPropertiesMetadata,
} from '../elasticsearch/metadata-handler';
import type { PostEntity } from './post.entity';
import { PostSearchBody } from './post-search.body';
import { getPureMapping } from './tools';

@Injectable()
export class PostSearchService {
  metadata = getIndexMetadata(PostSearchBody);
  fieldsMetadata = getPropertiesMetadata(PostSearchBody);

  constructor(private readonly elasticsearchService: ElasticsearchService) {
    // this.createIndex();
    this.search('Nar').then((data) => {
      console.log(data);
    });
    // this.index({
    //     id: '6b3ebe89-9e62-44c7-8b4e-d8ee42d5458d',
    //     title: 'Narek Hakobyan',
    //     description: 'qwe qwe qwe',
    //     userId: '7425c135-7dce-4ce8-a4ac-fb44cd32b73e',
    // });
    // this.index({
    //     id: '90a26300-ad65-4217-9986-d4ad6862a973',
    //     title: 'Narek',
    //     description: '123 12  12 ed wq eq we qwe',
    //     userId: 'b0e387fb-609b-4ae6-b48d-94f60eb6ffaa',
    // });
  }

  async index(post: PostSearchBody) {
    const a = await this.elasticsearchService.index<
      IElasticResult,
      PostSearchBody
    >({
      index: this.metadata.index,
      id: post.id,
      body: {
        id: post.id,
        title: post.title,
        description: post.description,
        userId: post.userId,
      },
    });

    return a;
  }

  async search(
    text: string,
    options?: Partial<{
      offset?: number;
      limit?: number;
    }>,
  ) {
    const a = await this.elasticsearchService.search<
      IElasticResult<PostSearchBody>
    >({
      index: this.metadata.index,
      from: options?.offset ?? 0,
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: text,
                  fields: ['title', 'description'],
                },
              },
            ],
            // filter: {
            //     range: {
            //         id: {
            //             gt: options?.startId,
            //         },
            //     },
            // },
          },
        },
        sort: {
          id: {
            order: 'asc',
          },
        },
      },
    });

    const hits = a.body.hits.hits;
    return hits.map((item) => item._source);
  }

  async putMapping(): Promise<any> {
    return this.elasticsearchService.indices.putMapping({
      index: this.metadata.index,
      type: this.metadata.type,
      body: {
        dynamic: 'strict',
        properties: getPureMapping(this.fieldsMetadata),
      },
    });
  }

  async createIndex(): Promise<any> {
    return this.elasticsearchService.indices.create({
      index: this.metadata.index,
    });
  }

  async remove(postId: number): Promise<void> {
    await this.elasticsearchService.deleteByQuery({
      index: this.metadata.index,
      body: {
        query: {
          match: {
            id: postId,
          },
        },
      },
    });
  }

  async update(post: PostEntity) {
    const newBody: PostSearchBody = {
      id: post.id,
      title: post.title,
      description: post.description,
      userId: post.userId,
    };

    const script = Object.entries(newBody).reduce(
      (result, [key, value]) =>
        `${result} ctx._source.${key}='${value as string}';`,
      '',
    );

    return this.elasticsearchService.updateByQuery({
      index: this.metadata.index,
      body: {
        query: {
          match: {
            id: post.id,
          },
        },
        script: {
          inline: script,
        },
      },
    });
  }
}
