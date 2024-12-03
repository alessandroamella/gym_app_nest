import { OmitType, PartialType } from '@nestjs/swagger';
import { AuthDto } from './auth.dto';

export class UpdateProfileDto extends PartialType(
  OmitType(AuthDto, ['password']),
) {}
