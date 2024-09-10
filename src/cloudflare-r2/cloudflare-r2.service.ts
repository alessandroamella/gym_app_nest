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
import { Media, MediaCategory, MediaType, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CloudflareR2Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private config: ConfigService,
    private readonly prisma: PrismaService,
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
    mediaCreateData: Omit<Prisma.MediaCreateInput, 'key' | 'url' | 'type'>,
  ): Promise<Media> {
    const { category, mime, userProfilePic, workout } = mediaCreateData;

    const type = mime.startsWith('image/')
      ? MediaType.IMAGE
      : mime.startsWith('video/')
        ? MediaType.VIDEO
        : null;

    if (!type) {
      throw new Error(`Unsupported ${category} file, mime type: ${mime}`);
    }

    const fileKey = uuidv4() + '.' + mime.split('/')[1];
    this.logger.log(
      'info',
      `Uploading file with key: ${fileKey} and size ${(fileBuffer.length / 1024).toFixed(1)}kB`,
    );

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: mime,
      });

      await this.s3Client.send(command);

      this.logger.log('info', `File uploaded successfully: ${fileKey}`);
      return this.prisma.media.create({
        data: {
          key: fileKey,
          url: `${this.config.get<string>('R2_PUBLIC_URL')}/${fileKey}`,
          mime: mime,
          category,
          type,
          userProfilePic,
          workout,
        },
      });
    } catch (error) {
      this.logger.error('Failed to upload file to Cloudflare R2', { error });
      throw new InternalServerErrorException(
        'Failed to upload file to Cloudflare R2',
      );
    }
  }

  async deleteFile(key: string, soft = false): Promise<void> {
    this.logger.log('info', `Deleting file with key: ${key}`);

    try {
      if (soft) {
        // Soft-delete the file
        await this.prisma.media.update({
          where: { key },
          data: { deletedAt: new Date() },
        });

        this.logger.log('info', `File soft-deleted successfully: ${key}`);
      } else {
        // Delete the file from the bucket
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          }),
        );

        await this.prisma.media.delete({
          where: { key },
        });

        this.logger.log('info', `File hard-deleted successfully: ${key}`);
      }
    } catch (error) {
      this.logger.error('Failed to delete file from Cloudflare R2', { error });
      throw new InternalServerErrorException(
        'Failed to delete file from Cloudflare R2',
      );
    }
  }
}
