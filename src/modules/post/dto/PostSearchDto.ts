import { IsNotEmpty, IsString } from 'class-validator';

export class PostSearchDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
