import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CommentCountDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  comments: number;
}
