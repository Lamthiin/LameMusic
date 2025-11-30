// src/shared/r2.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private readonly client: S3Client;
  private readonly bucket = process.env.R2_BUCKET_NAME as string;
  private readonly publicBase = process.env.R2_PUBLIC_BASE_URL as string;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT as string,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
      },
    });
  }

  async uploadFile(
    folder: string,
    fileName: string,
    buffer: Buffer,
    mime: string,
  ) {
    const key = `${folder}/${Date.now()}-${fileName}`;

    console.log('🚀 UPLOADING TO R2:', { key, mime, size: buffer.length });

    const result = await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
        ContentLength: buffer.length,
      }),
    );

    console.log('✅ R2 RESPONSE:', result);

    return {
      key,
      url: `${this.publicBase}/${key}`,
    };
  }

  /** Lấy key trong R2 từ public URL lưu trong DB */
  extractKeyFromUrl(url: string): string | null {
    if (!url) return null;
    if (!this.publicBase) return null;
    if (!url.startsWith(this.publicBase)) return null;
    return url.substring(this.publicBase.length + 1); // bỏ dấu '/'
  }

  /** Xoá 1 object trong R2 theo key */
  async deleteFileByKey(key: string) {
    if (!key) return;
    console.log('🗑 Deleting from R2:', key);

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  /** Xoá file thông qua URL (tiện cho xoá bài hát) */
  async deleteFileByUrl(url: string) {
    const key = this.extractKeyFromUrl(url);
    if (!key) return;
    return this.deleteFileByKey(key);
  }
}
