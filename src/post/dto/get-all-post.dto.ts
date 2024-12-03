import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MediaDto } from '../../media/dto/media.dto';
import { UserParentResourceDto } from 'shared/dto/user-parent-resource.dto';
import { NullableType } from 'joi';
import { PostLikesDto } from './post-likes.dto';

export class GetAllPostsResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  id: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({ example: 'Felt great today!', nullable: true })
  @IsOptional()
  @IsString()
  text?: NullableType<string>;

  @ApiProperty({ type: [MediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  media: MediaDto[];

  @ApiProperty({ type: UserParentResourceDto })
  @ValidateNested()
  @Type(() => UserParentResourceDto)
  user: UserParentResourceDto;

  @ApiProperty({ type: [PostLikesDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostLikesDto)
  likes: PostLikesDto[];
}
