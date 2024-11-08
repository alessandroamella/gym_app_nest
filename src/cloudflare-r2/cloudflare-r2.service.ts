import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CloudflareR2Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private config: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.bucketName = this.config.get<string>('R2_BUCKET_NAME');
    this.s3Client = new S3Client({
      region: 'auto', // R2 does not require a region, so use 'auto'
      endpoint: this.config.get<string>('R2_ENDPOINT_URL'), // e.g., https://<account_id>.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: this.config.get<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('R2_SECRET_ACCESS_KEY'),
      },
    });

    this.logger.log('info', 'CloudflareR2Service initialized');
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileMimeType: string,
  ): Promise<{ key: string; url: string }> {
    const fileKey = uuidv4() + '.' + fileMimeType.split('/')[1];
    this.logger.log(
      'info',
      `Uploading file with key: ${fileKey} and size ${(fileBuffer.length / 1024).toFixed(1)}kB`,
    );

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: fileMimeType,
      });

      await this.s3Client.send(command);

      this.logger.log('info', `File uploaded successfully: ${fileKey}`);
      return {
        key: fileKey,
        url: `${this.config.get<string>('R2_PUBLIC_URL')}/${fileKey}`,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to Cloudflare R2', { error });
      throw new InternalServerErrorException(
        'Failed to upload file to Cloudflare R2',
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    this.logger.log('info', `Deleting file with key: ${key}`);

    try {
      // Delete the file from the bucket
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      this.logger.log('info', `File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error('Failed to delete file from Cloudflare R2', { error });
      throw new InternalServerErrorException(
        'Failed to delete file from Cloudflare R2',
      );
    }
  }
}
