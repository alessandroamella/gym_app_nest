import { ApiProperty } from '@nestjs/swagger';
import { Gender, User, UserRole } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserDto implements Partial<User> {
  @ApiProperty({ description: 'The unique ID of the user', example: 1 })
  id: number;

  @ApiProperty({
    description: 'The fiscal code of the user',
    example: 'MLLLSN03L13F257N',
  })
  @IsNotEmpty()
  @IsString()
  fiscalCode: string;

  @ApiProperty({
    description: 'The gender of the user',
    enum: Gender,
    example: Gender.M,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'The birthdate of the user',
    example: '2003-07-13T00:00:00.000Z',
  })
  @IsDateString()
  birthdate: Date;

  @ApiProperty({
    description: 'The birthplace of the user',
    example: 'Modena',
  })
  @IsNotEmpty()
  @IsString()
  birthplace: string;

  @ApiProperty({ description: 'The birth province of the user', example: 'MO' })
  @IsNotEmpty()
  @IsString()
  birthProvince: string;

  @ApiProperty({ description: 'The username of the user', example: 'johndoe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'The path of the profile picture of the user',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profilePic?: string;

  @ApiProperty({
    description: 'The date and time the user was created',
    example: '2023-08-21T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time the user was last updated',
    example: '2023-08-21T12:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'The date and time the user was deleted',
    example: '2023-08-21T12:00:00.000Z',
  })
  @IsOptional()
  deletedAt?: Date;
}
