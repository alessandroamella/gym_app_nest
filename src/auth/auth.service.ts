import {
  BadRequestException,
  HttpStatus,
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

  async createUser(body: AuthDto) {
    const { username, password } = body;

    // username must be unique
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new BadRequestException('Username already taken');
    }

    const pwHash = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: { username, pwHash },
    });
  }

  async changePw(userId: number, password: string) {
    const pwHash = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { pwHash },
    });
  }

  async login(authDto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: authDto.username },
    });

    if (!user || !(await bcrypt.compare(authDto.password, user.pwHash))) {
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
        points: true,
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

    return user;
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

  async setDeviceToken(userId: number, token: string): Promise<HttpStatus.OK> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deviceToken: token,
      },
    });
    return HttpStatus.OK;
  }
}
