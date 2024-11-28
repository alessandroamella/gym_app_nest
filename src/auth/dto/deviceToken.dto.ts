import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DeviceTokenDto {
  @ApiProperty({ description: 'Firebase messaging token' })
  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
