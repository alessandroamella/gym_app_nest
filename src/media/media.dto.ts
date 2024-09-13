import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { MediaCategory, MediaType } from '@prisma/client';
import { UserDto } from 'auth/user.dto';
import {
  IsString,
  IsUrl,
  IsEnum,
  IsOptional,
  IsInt,
  IsDate,
} from 'class-validator';
import { WorkoutDto } from 'workout/workout.dto';

export class MediaDto {
  @ApiProperty({
    description: 'The unique key of the media file',
    example: 'unique-key-123',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'The URL of the media file',
    example: 'https://example.com/media.jpg',
    uniqueItems: true,
  })
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'If profile pic or workout related media',
    example: MediaCategory.PROFILE_PIC,
    enum: MediaCategory,
  })
  @IsEnum(MediaCategory)
  category: MediaCategory;

  @ApiProperty({
    description: 'The image or video type',
    example: MediaType.IMAGE,
    enum: MediaType,
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({
    description: 'The workout ID if the media is associated with a workout',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  workoutId?: number;

  @ApiPropertyOptional({
    description: 'The workout object if associated',
    type: WorkoutDto,
    required: false,
  })
  @IsOptional()
  workout?: WorkoutDto;

  @ApiProperty({
    description: 'The MIME type of the media',
    example: 'image/jpeg',
  })
  @IsString()
  mime: string;

  @ApiPropertyOptional({
    description: 'The user profile object if it is a profile picture',
    type: UserDto,
    required: false,
  })
  @IsOptional()
  userProfilePic?: UserDto;

  @ApiProperty({
    description: 'The date when the media was created',
    example: '2023-09-10T12:34:56.789Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the media was last updated',
    example: '2023-09-15T12:34:56.789Z',
  })
  @IsDate()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'The date when the media was deleted (soft delete)',
    example: '2023-09-20T12:34:56.789Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}

export class MediaUrlDto extends PickType(MediaDto, ['url'] as const) {}
