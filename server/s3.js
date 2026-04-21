import crypto from 'crypto';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const REQUIRED_ENV = ['AWS_REGION', 'AWS_BUCKET_NAME', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY'];
const MAX_SAFE_FILENAME_LENGTH = 120;

function assertS3Config() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing S3 configuration: ${missing.join(', ')}`);
  }
}

function parseEncryptionKey(rawKey) {
  if (!rawKey) return null;

  const key = rawKey.trim();
  if (/^[a-fA-F0-9]{64}$/.test(key)) {
    return Buffer.from(key, 'hex');
  }

  try {
    const base64 = Buffer.from(key, 'base64');
    if (base64.length === 32) return base64;
  } catch {
    // ignore invalid base64
  }

  const utf8 = Buffer.from(key, 'utf8');
  if (utf8.length === 32) return utf8;

  throw new Error('FILE_ENCRYPTION_KEY must be 32-byte utf8, 64-char hex, or base64 encoded 32-byte key');
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || '',
  },
});

const encryptionKey = parseEncryptionKey(process.env.FILE_ENCRYPTION_KEY || '');

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, MAX_SAFE_FILENAME_LENGTH);
}

function encryptBuffer(buffer) {
  if (!encryptionKey) {
    return { body: buffer, metadata: null };
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    body: encrypted,
    metadata: {
      algorithm: 'aes-256-gcm',
      iv: iv.toString('base64'),
      authTag: tag.toString('base64'),
      encrypted: true,
    },
  };
}

export async function uploadToS3(file, userId) {
  assertS3Config();

  const safeName = sanitizeFileName(file.originalname || 'file.bin');
  const key = `${userId}/${Date.now()}-${safeName}`;
  const { body, metadata } = encryptBuffer(file.buffer);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: file.mimetype || 'application/octet-stream',
    Metadata: metadata
      ? {
          encrypted: 'true',
          algorithm: metadata.algorithm,
          iv: metadata.iv,
          authTag: metadata.authTag,
        }
      : {
          encrypted: 'false',
        },
  };

  await s3.send(new PutObjectCommand(params));

  return {
    key,
    fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    encryptedMetadata: metadata,
  };
}

export async function deleteFromS3(fileUrl) {
  if (!fileUrl) return;
  assertS3Config();

  let key;
  try {
    const url = new URL(fileUrl);
    key = decodeURIComponent(url.pathname.replace(/^\//, ''));
  } catch {
    key = fileUrl;
  }

  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    })
  );
}
