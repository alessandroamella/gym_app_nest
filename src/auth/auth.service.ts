import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserAuthDto } from './dto/user-auth.dto';
import codiceFiscale from 'codice-fiscale-js';
import moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(UserAuthDto: UserAuthDto) {
    const { fiscalCode } = UserAuthDto;

    const {
      birthplace,
      birthplaceProvincia: birthProvince,
      day,
      gender,
      month,
      name,
      surname,
      year,
    } = codiceFiscale.computeInverse(fiscalCode);

    const birthdate = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD').toDate();

    const data = {
      birthdate,
      birthplace,
      birthProvince,
      gender,
      fiscalCode,
    };

    const username = [name, surname]
      .map((e) => e.split(' ')[0].replace(/\W/g, '').toLowerCase())
      .join('_');

    const user = await this.prisma.user.upsert({
      where: { fiscalCode },
      update: data,
      create: { ...data, username },
    });

    const payload = { userId: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  async getProfile(fiscalCode: string) {
    return this.prisma.user.findUnique({
      where: { fiscalCode },
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
                id: true,
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
