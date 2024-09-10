import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsDate,
} from 'class-validator';
import { WorkoutType } from '@prisma/client';
import { MediaDto } from 'media/media.dto';
import { UserDto } from 'auth/user.dto';

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

export class WorkoutDto extends CreateWorkoutDto {
  @ApiProperty({
    description: 'The unique ID of the workout',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'The unique ID of the users associated with the workout',
    type: UserDto,
    isArray: true,
  })
  users: UserDto[];

  @ApiProperty({
    description: 'The unique ID of the media associated with the workout',
    type: MediaDto,
    isArray: true,
  })
  media: MediaDto[];

  @ApiProperty({
    description: 'The creation date of the workout',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'The update date of the workout',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  updatedAt: Date;
}
