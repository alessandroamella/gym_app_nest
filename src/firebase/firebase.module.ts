import { Inject, Module } from '@nestjs/common';
import firebaseAdmin from 'firebase-admin';
import type { Notification } from 'firebase-admin/lib/messaging/messaging-api';
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
    const app = firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(JSON.parse(serviceAccount)),
    });
    this.logger.info(`Firebase app ${app.name} initialized`);
  }

  public async sendMessage(token: string, notification: Notification) {
    this.logger.debug('Sending message to Firebase');
    await firebaseAdmin.messaging().send({
      condition: "'all'",
      token,
      topic: 'all',
      notification,
    });
    this.logger.info('Message sent to Firebase');
  }
}
