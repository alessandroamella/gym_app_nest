import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserAuthDto } from './dto/user-auth.dto';
import codiceFiscale from 'codice-fiscale-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import _ from 'lodash';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';
import { JwtPayload } from './jwt-payload.interface';
import { Media, MediaCategory } from '@prisma/client';

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

    const parsed = codiceFiscale.computeInverse(fiscalCode);
    this.logger.debug(
      'Parsed data: ' +
        JSON.stringify(
          _.omit({ ...userAuthDto, ...parsed }, 'profilePic'),
          null,
          2,
        ),
    );
    const {
      birthplace,
      birthplaceProvincia,
      day,
      gender,
      month,
      name,
      surname,
      year,
    } = parsed;

    const birthdate = dayjs
      .utc(`${year}-${month}-${day}`, 'YYYY-MM-DD')
      .toDate();

    let profilePicMedia: Media | undefined;

    if (profilePic) {
      this.logger.debug('Uploading profile picture');
      profilePicMedia = await this.r2Service.uploadFile(profilePic.buffer, {
        mime: profilePic.mimetype,
        category: MediaCategory.PROFILE_PIC,
        userProfilePic: {
          connect: { fiscalCode },
        },
      });
    }

    const oldProfile = await this.prisma.user.findUnique({
      where: { fiscalCode, NOT: { profilePic: null } },
      select: { profilePic: true },
    });
    if (oldProfile) {
      this.logger.debug(
        'Deleting old profile picture: ' +
          JSON.stringify(oldProfile.profilePic),
      );
      await this.r2Service.deleteFile(oldProfile.profilePic.key);
    }

    const username =
      userAuthDto.username ||
      [name, surname]
        .map((e) => e.split(' ')[0].replace(/\W/g, '').toLowerCase())
        .join('_');

    const data = {
      birthdate,
      birthplace: _.startCase(_.toLower(birthplace)),
      birthProvince: birthplaceProvincia,
      gender,
      fiscalCode,
      profilePic: profilePicMedia && {
        connect: { key: profilePicMedia.key },
      },
      username,
    };

    const newUser = await this.prisma.user.upsert({
      where: { fiscalCode },
      update: data,
      create: data,
    });

    const user = await this.getProfile(newUser.id);

    const payload: JwtPayload = { userId: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  async getProfile(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        createdAt: true,
        fiscalCode: true,
        gender: true,
        id: true,
        profilePic: true,
        role: true,
        username: true,
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
                profilePic: true,
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
