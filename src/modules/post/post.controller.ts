import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  TcpContext,
} from '@nestjs/microservices';
import { IsNotEmpty, IsString } from 'class-validator';

class PostSearchDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}

@Controller('posts')
export class PostController {
  @MessagePattern('search')
  sum(
    @Payload() postSearchDto: PostSearchDto,
    @Ctx() context: TcpContext,
  ): string {
    console.log(context);
    console.log(postSearchDto);
    return '';
  }
}
