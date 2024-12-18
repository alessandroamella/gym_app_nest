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
import { CommentCountDto } from './comment-count.dto';
import { UserParentResourceDto } from 'shared/dto/user-parent-resource.dto';
import { NullableType } from 'joi';

export class GetAllWorkoutsResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  id: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({ example: 'Felt great today!', nullable: true })
  @IsOptional()
  @IsString()
  notes?: NullableType<string>;

  @ApiProperty({ type: [MediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  media: MediaDto[];

  @ApiProperty({ type: UserParentResourceDto })
  @ValidateNested()
  @Type(() => UserParentResourceDto)
  user: UserParentResourceDto;

  @ApiProperty({ type: CommentCountDto })
  @ValidateNested()
  @Type(() => CommentCountDto)
  _count: CommentCountDto;

  @ApiProperty()
  @IsInt()
  points: number;
}
