import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { GetProfileDto } from './get-profile.dto';

export class AuthDto extends PickType(GetProfileDto, ['username']) {
  @ApiProperty({ example: 'password' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
