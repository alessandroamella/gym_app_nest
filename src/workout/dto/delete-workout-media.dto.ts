import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteWorkoutMediaDto {
  @ApiProperty({
    description: 'The key of the media to delete',
  })
  @IsNotEmpty()
  @IsString()
  key: string;
}
