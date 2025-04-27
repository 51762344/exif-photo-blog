import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageListResponse, generateStorageId } from '.';
import { formatBytesToMB } from '@/utility/number';

const ALIYUN_OSS_BUCKET = process.env.NEXT_PUBLIC_ALIYUN_OSS_BUCKET ?? '';
const ALIYUN_OSS_REGION = process.env.NEXT_PUBLIC_ALIYUN_OSS_REGION ?? '';
const ALIYUN_OSS_ACCESS_KEY = process.env.ALIYUN_OSS_ACCESS_KEY ?? '';
const ALIYUN_OSS_SECRET_ACCESS_KEY = process.env.ALIYUN_OSS_SECRET_ACCESS_KEY ?? '';

export const ALIYUN_OSS_BASE_URL = ALIYUN_OSS_BUCKET && ALIYUN_OSS_REGION
  ? `https://${ALIYUN_OSS_BUCKET}.${ALIYUN_OSS_REGION}.aliyuncs.com`
  : undefined;

export const aliyunOssClient = () => new S3Client({
  region: ALIYUN_OSS_REGION,
  endpoint: `https://${ALIYUN_OSS_REGION}.aliyuncs.com`,
  credentials: {
    accessKeyId: ALIYUN_OSS_ACCESS_KEY,
    secretAccessKey: ALIYUN_OSS_SECRET_ACCESS_KEY,
  },
});

const urlForKey = (key?: string) => `${ALIYUN_OSS_BASE_URL}/${key}`;

export const isUrlFromAliyunOss = (url?: string) =>
  ALIYUN_OSS_BASE_URL && url?.startsWith(ALIYUN_OSS_BASE_URL);

export const aliyunOssPutObjectCommandForKey = (Key: string) =>
  new PutObjectCommand({ Bucket: ALIYUN_OSS_BUCKET, Key, ACL: 'public-read' });

export const aliyunOssPut = async (
  file: Buffer,
  fileName: string,
): Promise<string> =>
  aliyunOssClient().send(new PutObjectCommand({
    Bucket: ALIYUN_OSS_BUCKET,
    Key: fileName,
    Body: file,
    ACL: 'public-read',
  }))
    .then(() => urlForKey(fileName));

export const aliyunOssCopy = async (
  fileNameSource: string,
  fileNameDestination: string,
  addRandomSuffix?: boolean,
) => {
  const name = fileNameSource.split('.')[0];
  const extension = fileNameSource.split('.')[1];
  const Key = addRandomSuffix
    ? `${name}-${generateStorageId()}.${extension}`
    : fileNameDestination;
  return aliyunOssClient().send(new CopyObjectCommand({
    Bucket: ALIYUN_OSS_BUCKET,
    CopySource: `${ALIYUN_OSS_BUCKET}/${fileNameSource}`,
    Key,
    ACL: 'public-read',
  }))
    .then(() => urlForKey(fileNameDestination));
};

export const aliyunOssList = async (
  Prefix: string,
): Promise<StorageListResponse> =>
  aliyunOssClient().send(new ListObjectsCommand({
    Bucket: ALIYUN_OSS_BUCKET,
    Prefix,
  }))
    .then((data) => data.Contents?.map(({ Key, LastModified, Size }) => ({
      url: urlForKey(Key),
      fileName: Key ?? '',
      uploadedAt: LastModified,
      size: Size ? formatBytesToMB(Size) : undefined,
    })) ?? []);

export const aliyunOssDelete = async (Key: string) => {
  aliyunOssClient().send(new DeleteObjectCommand({
    Bucket: ALIYUN_OSS_BUCKET,
    Key,
  }));
}; 