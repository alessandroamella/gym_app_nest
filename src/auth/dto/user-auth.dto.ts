import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  MinLength,
  MaxLength,
  IsAlphanumeric,
  IsOptional,
} from 'class-validator';

export class UserAuthDto {
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
  })
  @IsOptional()
  profilePic?: Express.Multer.File;
}
