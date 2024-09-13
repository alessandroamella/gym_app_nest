import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Gender, User, UserRole } from '@prisma/client';
import {
  IsAlphanumeric,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaDto, MediaUrlDto } from 'media/media.dto';

export class UserAuthDto implements Partial<User> {
  @ApiProperty({
    description: 'Fiscal code of the user',
  })
  @IsString()
  @IsNotEmpty()
  @Length(16, 16)
  @Matches(
    /^(?:[A-Z][AEIOU][AEIOUX]|[AEIOU]X{2}|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i,
  )
  fiscalCode: string;

  @ApiProperty({
    description: 'Username of the user',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @IsAlphanumeric()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'File to be uploaded as profile picture',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  profilePic?: Express.Multer.File;
}

export class UserDto
  extends OmitType(UserAuthDto, ['profilePic'])
  implements Partial<User>
{
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
  @Type(() => Date)
  birthdate: Date;

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
    type: MediaUrlDto,
    required: false,
  })
  @IsOptional()
  profilePic?: Pick<MediaDto, 'url'>;

  @ApiProperty({
    description: 'The date and time the user was created',
    example: '2023-08-21T12:00:00.000Z',
  })
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time the user was last updated',
    example: '2023-08-21T12:00:00.000Z',
  })
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({
    description: 'The date and time the user was deleted',
    example: '2023-08-21T12:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  deletedAt?: Date;
}

export class LoginDto {
  @ApiProperty({ description: 'The user object', type: UserDto })
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({
    description: 'The JWT token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
