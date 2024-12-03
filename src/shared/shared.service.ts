import { Injectable } from '@nestjs/common';

@Injectable()
export class SharedService {
  public readonly userParentResourceSelect = {
    id: true,
    username: true,
    profilePic: {
      select: {
        url: true,
      },
    },
    points: true,
  };

  public readonly mediaOnlyURLSelect = {
    url: true,
  };

  public readonly mediaWithMimeSelect = {
    ...this.mediaOnlyURLSelect,
    mime: true,
  };
}
