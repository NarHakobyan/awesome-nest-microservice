import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import type { PostEntity } from './post.entity';
import { PostRepository } from './post.repository';
import { PostSearchService } from './post-search.service';

@Injectable()
export class PostsService {
    constructor(
        private postRepository: PostRepository,
        private postSearchService: PostSearchService,
    ) {}

    async createPost(post: any) {
        const newPost = this.postRepository.create(post);
        await this.postRepository.save(newPost);
        await this.postSearchService.index(newPost);
        return newPost;
    }

    async search(text: string): Promise<PostEntity[]> {
        const results = await this.postSearchService.search(text);
        const ids = results.map((result) => result.id);
        if (ids.length === 0) {
            return [];
        }
        return this.postRepository.find({
            where: { id: In(ids) },
        });
    }

    async updatePost(id: number, post: UpdatePostDto) {
        await this.postRepository.update(id, post);
        const updatedPost = await this.postRepository.findOne(id);
        // if (!updatedPost) {
        //     throw new PostNotFoundException(id);
        // }

        await this.postSearchService.update(updatedPost);
        return updatedPost;
    }

    async delete(postId: number) {
        await this.postRepository.delete(postId);
        await this.postSearchService.remove(postId);
    }
}
