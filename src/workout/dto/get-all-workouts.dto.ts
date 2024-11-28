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
import { WorkoutMediaDto } from './workout-media.dto';
import { WorkoutUserDto } from './workout-user.dto';
import { CommentCountDto } from './comment-count.dto';

export class GetAllWorkoutsResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
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
  notes: string | null;

  @ApiProperty({ type: [WorkoutMediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutMediaDto)
  media: WorkoutMediaDto[];

  @ApiProperty({ type: WorkoutUserDto })
  @ValidateNested()
  @Type(() => WorkoutUserDto)
  user: WorkoutUserDto;

  @ApiProperty({ type: CommentCountDto })
  @ValidateNested()
  @Type(() => CommentCountDto)
  _count: CommentCountDto;

  @ApiProperty()
  @IsInt()
  points: number;
}
