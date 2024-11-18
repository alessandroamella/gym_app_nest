import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateWorkoutMediaDto {
  @ApiProperty({
    description: 'Workout ID',
  })
  @IsNumber()
  workoutId: number;

  @ApiProperty({
    description: 'Media file',
    type: 'string',
    format: 'binary',
  })
  file: {
    buffer: Buffer;
    mimetype: string;
  };
}
