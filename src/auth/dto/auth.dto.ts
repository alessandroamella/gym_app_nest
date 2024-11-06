import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({ example: 'username' })
  @IsString()
  readonly username: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(1)
  readonly password: string;
}
