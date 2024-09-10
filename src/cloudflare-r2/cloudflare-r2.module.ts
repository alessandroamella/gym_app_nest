import { Module } from '@nestjs/common';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  providers: [CloudflareR2Service],
  exports: [CloudflareR2Service],
  imports: [PrismaModule],
})
export class CloudflareR2Module {}
