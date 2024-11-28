import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const hashedInternalApiKey = this.config.get<string>(
      'INTERNAL_API_KEY_HASH',
    );

    if (!hashedInternalApiKey) {
      // this should never happen!!
      throw new Error('INTERNAL_API_KEY environment variable is not set.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (hashedInternalApiKey !== hashedToken) {
      this.logger.debug(`Invalid token for internal API auth: ${token}`);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
