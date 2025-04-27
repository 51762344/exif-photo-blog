import { removeUrlProtocol } from '@/utility/url';
import type { NextConfig } from 'next';
import { RemotePattern } from 'next/dist/shared/lib/image-config';

const VERCEL_BLOB_STORE_ID = process.env.BLOB_READ_WRITE_TOKEN?.match(
  /^vercel_blob_rw_([a-z0-9]+)_[a-z0-9]+$/i,
)?.[1].toLowerCase();

const HOSTNAME_VERCEL_BLOB = VERCEL_BLOB_STORE_ID
  ? `${VERCEL_BLOB_STORE_ID}.public.blob.vercel-storage.com`
  : undefined;

const HOSTNAME_CLOUDFLARE_R2 =
  process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN;

const HOSTNAME_AWS_S3 =
  process.env.NEXT_PUBLIC_AWS_S3_BUCKET &&
  process.env.NEXT_PUBLIC_AWS_S3_REGION
    // eslint-disable-next-line max-len
    ? `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com`
    : undefined;

const HOSTNAME_ALIYUN_OSS = process.env.NEXT_PUBLIC_ALIYUN_OSS_DOMAIN;

const generateRemotePattern = (hostname: string) =>
  ({
    protocol: 'https',
    hostname: removeUrlProtocol(hostname)!,
    port: '',
    pathname: '/**',
  } as const);

const remotePatterns: RemotePattern[] = [];

if (HOSTNAME_VERCEL_BLOB) {
  remotePatterns.push(generateRemotePattern(HOSTNAME_VERCEL_BLOB));
}
if (HOSTNAME_CLOUDFLARE_R2) {
  remotePatterns.push(generateRemotePattern(HOSTNAME_CLOUDFLARE_R2));
}
if (HOSTNAME_AWS_S3) {
  remotePatterns.push(generateRemotePattern(HOSTNAME_AWS_S3));
}
if (HOSTNAME_ALIYUN_OSS) {
  remotePatterns.push(generateRemotePattern(HOSTNAME_ALIYUN_OSS));
}

const nextConfig: NextConfig = {
  images: {
    imageSizes: [50, 200, 300, 640, 750, 828, 1080, 1200, 1920, 2048],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ['image/webp', 'image/avif'],
    remotePatterns,
    minimumCacheTTL: 31536000,
  },
};

module.exports = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')()(nextConfig)
  : nextConfig;
