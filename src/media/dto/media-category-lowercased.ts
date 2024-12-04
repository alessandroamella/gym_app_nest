import { ApiProperty } from '@nestjs/swagger';
import { MediaCategory } from '@prisma/client';
import { IsIn } from 'class-validator';

export const mediaCategoryMap = {
  workout: MediaCategory.WORKOUT,
  post: MediaCategory.POST,
  // profilePic: MediaCategory.PROFILE_PIC,
} as const;

const categoriesLowercased = Object.keys(
  mediaCategoryMap,
) as (keyof typeof mediaCategoryMap)[];

export type LowercasedMediaCategory = keyof typeof mediaCategoryMap;

export class MediaCategoryLowercasedDto {
  @ApiProperty({
    description: 'Media category',
    type: 'string',
    enum: categoriesLowercased,
  })
  @IsIn(categoriesLowercased, {
    message(validationArguments) {
      return `${validationArguments.value} is not a valid media category. Use ${categoriesLowercased.join(
        ', ',
      )}`;
    },
  })
  category: LowercasedMediaCategory;
}
