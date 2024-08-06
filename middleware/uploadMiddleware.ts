import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import rds from '../infra/redisConfig'; // Import your Redis client

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME!,
        key: function (req, file, cb) {
            console.log('Generating key for file:', file.originalname);
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        console.log('File type:', file.mimetype);
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, only images and videos are allowed!') as any);
        }
    }
});

console.log('Multer S3 configuration complete');

export const getSignedUrlForKey = async (key: string) => {
    // Check for existing Redis key
    const cachedUrl = await rds.get(`image_url:${key}`);
    if (cachedUrl) {
        console.log('Returning cached URL for key:', key);
        return cachedUrl;
    }

    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour

    // Cache the URL in Redis
    await rds.set(`image_url:${key}`, url, {
        EX: 3590 // Set expiration to 1 hour (same as the signed URL)
    });

    console.log('Cached new URL for key:', key);
    return url;
};