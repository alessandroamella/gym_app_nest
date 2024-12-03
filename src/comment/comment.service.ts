import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from 'prisma/prisma.service';
import { SharedService } from 'shared/shared.service';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private shared: SharedService,
  ) {}

  async create(
    userId: number,
    workoutId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const workout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        userId,
        workoutId,
      },
    });
  }

  async findAll(workoutId: number) {
    return this.prisma.comment.findMany({
      where: { workoutId },
      include: {
        user: {
          select: {
            username: true,
            profilePic: { select: this.shared.mediaOnlyURLSelect },
          },
        },
      },
    });
  }

  async remove(userId: number, id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new UnauthorizedException('Unauthorized to delete this comment');
    }

    return this.prisma.comment.delete({ where: { id } });
  }
}
