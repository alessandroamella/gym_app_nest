import { PickType } from '@nestjs/swagger';
import { GetProfileDto } from 'auth/dto/get-profile.dto';

export class UserParentResourceDto extends PickType(GetProfileDto, [
  'id',
  'username',
  'profilePic',
  'points',
]) {}
