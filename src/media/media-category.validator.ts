import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { mediaCategoryMap } from './dto/media-category-lowercased';

@Injectable()
export class ValidateMediaCategoryPipe implements PipeTransform {
  transform(value: string) {
    const allowedCategories = Object.keys(mediaCategoryMap);

    if (!allowedCategories.includes(value)) {
      throw new BadRequestException(
        `Invalid category. Use: ${allowedCategories.join(', ')}`,
      );
    }
    return value;
  }
}
