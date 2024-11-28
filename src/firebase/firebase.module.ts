import { Inject, Module } from '@nestjs/common';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { join } from 'path';
import { cwd } from 'process';
import { Logger } from 'winston';

@Module({})
export class FirebaseModule {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.initializeApp();
  }

  private async initializeApp() {
    this.logger.debug('Initializing Firebase app');
    const serviceAccount = await readFile(
      join(cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
      'utf8',
    );
    const app = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
    this.logger.info(`Firebase app ${app.name} initialized`);
  }
}
