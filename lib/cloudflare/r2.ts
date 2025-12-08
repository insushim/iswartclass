import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'artsheet-pro';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/png'
): Promise<string> {
  try {
    await R2.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    return `${PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload to R2');
  }
}

export async function getFromR2(key: string): Promise<Buffer | null> {
  try {
    const response = await R2.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));

    if (response.Body) {
      const chunks: Uint8Array[] = [];
      const body = response.Body as AsyncIterable<Uint8Array>;
      for await (const chunk of body) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
    return null;
  } catch (error) {
    console.error('R2 get error:', error);
    return null;
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  try {
    await R2.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));
  } catch (error) {
    console.error('R2 delete error:', error);
    throw new Error('Failed to delete from R2');
  }
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(R2, command, { expiresIn });
}

export async function generateThumbnail(
  buffer: Buffer,
  size: number = 400
): Promise<Buffer> {
  // Dynamic import for sharp to avoid issues in edge runtime
  const sharp = (await import('sharp')).default;

  return sharp(buffer)
    .resize(size, size, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();
}

export async function uploadWithThumbnail(
  buffer: Buffer,
  basePath: string,
  filename: string
): Promise<{ imageUrl: string; thumbnailUrl: string }> {
  const thumbnail = await generateThumbnail(buffer);

  const [imageUrl, thumbnailUrl] = await Promise.all([
    uploadToR2(buffer, `${basePath}/${filename}.png`),
    uploadToR2(thumbnail, `${basePath}/thumbnails/${filename}.png`),
  ]);

  return { imageUrl, thumbnailUrl };
}

export async function uploadMultiple(
  files: Array<{ buffer: Buffer; key: string; contentType?: string }>
): Promise<string[]> {
  const results = await Promise.all(
    files.map(file =>
      uploadToR2(file.buffer, file.key, file.contentType)
    )
  );
  return results;
}

export function getR2PublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export function extractKeyFromUrl(url: string): string {
  if (!url.startsWith(PUBLIC_URL)) {
    return url;
  }
  return url.replace(`${PUBLIC_URL}/`, '');
}
