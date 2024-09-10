import { Module } from '@nestjs/common';
import { CloudflareR2Service } from './cloudflare-r2.service';

@Module({
  providers: [CloudflareR2Service],
  exports: [CloudflareR2Service],
})
export class CloudflareR2Module {}
