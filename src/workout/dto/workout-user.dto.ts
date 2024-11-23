import { ApiProperty } from '@nestjs/swagger';

export class WorkoutUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({
    example: 'https://storage.cloudflare.com/profile-pic-123.jpg',
    nullable: true,
  })
  profilePicUrl: string | null;
}
