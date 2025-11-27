import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private readonly client: S3Client;
  private readonly bucket = process.env.R2_BUCKET_NAME as string;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!, // ex: https://xxxx.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFile(folder: string, fileName: string, buffer: Buffer, mime: string) {
    const key = `${folder}/${Date.now()}-${fileName}`;

    console.log("🚀 UPLOADING TO R2:", { key, mime, size: buffer.length });

    try {
      const result = await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mime,
          ContentLength: buffer.length, // 🔥 MUST HAVE
        })
      );

      console.log("✅ R2 RESPONSE:", result);

      return {
        key,
        url: `${process.env.R2_PUBLIC_BASE_URL}/${key}`,
      };
    } catch (error) {
      console.log("❌ R2 UPLOAD ERROR:", error);
      throw error;
    }
  }
}
