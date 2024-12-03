import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsObject } from 'class-validator';
import { UserParentResourceDto } from 'shared/dto/user-parent-resource.dto';

export class PostLikesDto {
  @ApiProperty()
  @Type(() => UserParentResourceDto)
  @IsObject()
  user: UserParentResourceDto;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  createdAt: Date;
}
