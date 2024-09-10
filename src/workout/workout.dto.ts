import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { WorkoutType } from '@prisma/client';

export class CreateWorkoutDto {
  @ApiProperty({
    description: 'The start time of the workout',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'The end time of the workout',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'The type of workout',
    enum: WorkoutType,
  })
  @IsEnum(WorkoutType)
  type: WorkoutType;

  @ApiProperty({
    description: 'Optional notes for the workout',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWorkoutDto extends PartialType(CreateWorkoutDto) {}

export class WorkoutMediaDto {
  @ApiProperty({
    description: 'Files to be uploaded as workout media',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  files: Express.Multer.File[];
}
