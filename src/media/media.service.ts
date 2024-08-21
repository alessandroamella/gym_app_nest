import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Media } from '@prisma/client';
import { CreateMediaDto, UpdateMediaDto } from './media.dto';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    return this.prisma.media.create({
      data: createMediaDto,
    });
  }

  async findAll(): Promise<Media[]> {
    return this.prisma.media.findMany();
  }

  async findOne(id: number): Promise<Media | null> {
    return this.prisma.media.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    return this.prisma.media.update({
      where: { id },
      data: updateMediaDto,
    });
  }

  async remove(id: number): Promise<Media> {
    return this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
