import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDate,
  IsInt,
  ValidateNested,
  IsObject,
  IsNotEmpty,
  Min,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommentCountDto } from 'workout/dto/comment-count.dto';

class ProfileCountDto extends CommentCountDto {
  @ApiProperty({ description: 'Number of workouts created by the user' })
  @IsInt()
  workouts: number;
}

export class GetProfileDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Points accumulated', example: 69 })
  @IsInt()
  @Min(0)
  points: number;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  profilePicUrl?: string;

  @ApiProperty({ description: 'Account creation timestamp' })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ type: ProfileCountDto, description: 'Profile counts' })
  @ValidateNested()
  @Type(() => ProfileCountDto)
  @IsObject()
  _count: ProfileCountDto;
}
