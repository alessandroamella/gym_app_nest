import { ApiProperty } from '@nestjs/swagger';

class ProfileCounts {
  @ApiProperty({ description: 'Number of workouts created by the user' })
  workouts: number;

  @ApiProperty({ description: 'Number of comments made by the user' })
  comments: number;
}

export class GetProfileDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: 'Points accumulated', example: 69 })
  points: number;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profilePicUrl?: string;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;

  @ApiProperty({ type: ProfileCounts, description: 'Profile counts' })
  _count: ProfileCounts;
}
