import { ApiProperty, PickType } from '@nestjs/swagger';
import { GetProfileDto } from 'auth/dto/get-profile.dto';

export class RankingDto extends PickType(GetProfileDto, ['id']) {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Total workout duration of the user in seconds',
    example: 3600,
  })
  totalWorkoutDuration: number;

  @ApiProperty({
    description: 'Total points earned by the user',
    example: 1500,
  })
  totalPoints: number;
}
