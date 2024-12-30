import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from 'auth/auth.guard';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { RankingService } from './ranking.service';
import { RankingDto } from './dto/ranking.dto';

@Controller('ranking')
@ApiTags('ranking')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RankingController {
  constructor(
    private rankingService: RankingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'List of rankings',
    type: [RankingDto],
  })
  async getRanking() {
    return this.rankingService.getRanking();
  }
}
