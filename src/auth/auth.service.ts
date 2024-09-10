import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import codiceFiscale from 'codice-fiscale-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import _ from 'lodash';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';
import { JwtPayload } from './jwt-payload.interface';
import { Media, MediaCategory, MediaType } from '@prisma/client';
import { UserAuthDto, UserDto } from './user.dto';

dayjs.extend(utc);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private r2Service: CloudflareR2Service,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async login(userAuthDto: UserAuthDto) {
    const { fiscalCode, profilePic } = userAuthDto;

    let parsed: ReturnType<typeof codiceFiscale.computeInverse>;
    try {
      parsed = codiceFiscale.computeInverse(fiscalCode);
    } catch (err) {
      this.logger.debug('Entered fiscal code is invalid');
      this.logger.debug(err);
      throw new BadRequestException('Invalid fiscal code');
    }
    this.logger.debug(
      'Parsed data: ' +
        JSON.stringify(
          _.omit({ ...userAuthDto, ...parsed }, 'profilePic'),
          null,
          2,
        ),
    );
    const { day, gender, month, name, surname, year } = parsed;

    const birthdate = dayjs
      .utc(`${year}-${month}-${day}`, 'YYYY-MM-DD')
      .toDate();

    const existingUser = await this.prisma.user.findUnique({
      where: { fiscalCode },
      select: { username: true, profilePic: true },
    });
    if (existingUser?.profilePic) {
      this.logger.debug(
        'Deleting old profile picture: ' +
          JSON.stringify(existingUser.profilePic),
      );
      await this.r2Service.deleteFile(existingUser.profilePic.key);
    }

    const username =
      userAuthDto.username ||
      existingUser?.username ||
      [name, surname]
        .map((e) => e.split(' ')[0].replace(/\W/g, '').toLowerCase())
        .join('_');

    const data = {
      birthdate,
      gender,
      fiscalCode,
      username,
    };

    const newUser = await this.prisma.user.upsert({
      where: { fiscalCode },
      update: data,
      create: data,
    });

    if (profilePic) {
      this.logger.debug('Uploading profile picture');
      const { key, url } = await this.r2Service.uploadFile(
        profilePic.buffer,
        profilePic.mimetype,
      );

      await this.prisma.media.create({
        data: {
          key,
          type: MediaType.IMAGE,
          url,
          category: MediaCategory.PROFILE_PIC,
          mime: profilePic.mimetype,
          userProfilePic: { connect: { id: newUser.id } },
        },
      });
    }

    const user = await this.getProfile(newUser.id);

    const payload: JwtPayload = { userId: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  async getProfile(id: number): Promise<UserDto> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        profilePic: {
          select: {
            url: true,
          },
        },
        username: true,
        birthdate: true,
        updatedAt: true,
        fiscalCode: true,
        gender: true,
        role: true,
        createdAt: true,
        workouts: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            type: true,
            notes: true,
            users: {
              select: {
                id: true,
                username: true,
                profilePic: {
                  select: {
                    url: true,
                  },
                },
              },
            },
            media: {
              select: {
                type: true,
                url: true,
              },
            },
          },
        },
      },
    });
  }
}
