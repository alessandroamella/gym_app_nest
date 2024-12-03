import { PickType } from '@nestjs/swagger';
import { GetAllPostsResponseDto } from './get-all-post.dto';

export class CreatePostDto extends PickType(GetAllPostsResponseDto, ['text']) {}
