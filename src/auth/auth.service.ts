import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthDto } from './dto/auth.dto';
import type { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';
import { PrismaService } from 'prisma/prisma.service';
import { GetProfileDto } from './dto/get-profile.dto';
import { WorkoutService } from 'workout/workout.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private workoutService: WorkoutService,
    private cloudflareR2Service: CloudflareR2Service,
  ) {}

  async login(loginDto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.pwHash))) {
      throw new BadRequestException('Invalid username or password');
    }

    const token = this.jwtService.sign({ userId: user.id });
    return { token };
  }

  async getProfile(userId: number): Promise<GetProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        profilePicUrl: true,
        createdAt: true,
        _count: {
          select: {
            workouts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const workouts = await this.prisma.workout.findMany({
      where: { userId },
      select: { durationMin: true },
    });

    // every 45 minutes of workout = 1 point
    // FLOOR the result (e.g. 44 minutes = 0 points, 45 minutes = 1 point)
    const points =
      workouts
        .map((workout) => this.workoutService.calculatePoints(workout))
        .reduce((a, b) => a + b, 0) || 0;

    return { ...user, points };
  }

  async updateProfile(userId: number, body: AuthDto) {
    const { username, password } = body;

    // username must be unique
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Username already taken');
    }

    const updateData: Prisma.UserUpdateInput = { username };

    if (password) {
      updateData.pwHash = await bcrypt.hash(password, 10);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async updateProfilePic(userId: number, file: Express.Multer.File) {
    const { key, url } = await this.cloudflareR2Service.uploadFile(
      file.buffer,
      file.mimetype,
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { profilePicKey: key, profilePicUrl: url },
    });
    return { url };
  }
}
