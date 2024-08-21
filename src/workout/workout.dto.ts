import { Workout, WorkoutType } from '@prisma/client';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMediaDto } from 'media/media.dto';

export class CreateWorkoutDto
  implements Omit<Workout, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>
{
  @ApiProperty()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty()
  @IsEnum(WorkoutType)
  @IsNotEmpty()
  type: WorkoutType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notes: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media: CreateMediaDto[];
}

export class UpdateWorkoutDto extends PartialType(CreateWorkoutDto) {}

export class WorkoutDto extends CreateWorkoutDto implements Partial<Workout> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;
}
