import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthDto } from './dto/auth.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { GetProfileDto } from './dto/get-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { SharedService } from 'shared/shared.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private shared: SharedService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createUser(body: AuthDto) {
    const { username, password } = body;

    // username must be unique
    const existingUser = await this.prisma.user.findFirst({
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
        profilePic: {
          select: this.shared.mediaOnlyURLSelect,
        },
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

  async updateProfile(userId: number, body: UpdateProfileDto) {
    const { username } = body;

    // username must be unique
    const existingUser = await this.prisma.user.findFirst({
      where: { username },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Username already taken');
    }

    const updateData: UpdateProfileDto = { username };

    this.logger.debug(
      `Updating user ${userId} with ${JSON.stringify(updateData)}`,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
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
