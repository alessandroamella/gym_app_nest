import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { WorkoutType } from '@prisma/client';
import { MediaDto, MediaUrlDto } from 'media/media.dto';
import { UserDto } from 'auth/user.dto';

export class CreateWorkoutDto {
  @ApiProperty({
    description: 'The start time of the workout',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  startTime: Date;

  @ApiProperty({
    description: 'The end time of the workout',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  endTime: Date;

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

export class WorkoutMediaDto extends CreateWorkoutDto {
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
    type: MediaUrlDto,
    required: false,
  })
  @IsOptional()
  media?: Pick<MediaDto, 'url'>[];

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
