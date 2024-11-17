import { ApiProperty } from '@nestjs/swagger';

export class WorkoutMediaDto {
  @ApiProperty({ example: 'https://storage.cloudflare.com/workout-123.jpg' })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  mime: string;
}
