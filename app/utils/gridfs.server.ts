import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { PrismaClient } from '@prisma/client';

let bucket: GridFSBucket | null = null;

export async function getGridFSBucket() {
    if (bucket) return bucket;

    // Get MongoDB URL from Prisma
    const prisma = new PrismaClient();
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    try {
        const client = await MongoClient.connect(databaseUrl);
        const db = client.db();
        bucket = new GridFSBucket(db, {
            bucketName: 'contracts'
        });
        return bucket;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

export async function uploadFileToGridFS(file: Buffer, filename: string, contentType?: string): Promise<string> {
    const bucket = await getGridFSBucket();
    
    return new Promise((resolve, reject) => {
        // Create upload stream with metadata
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: contentType || 'application/octet-stream',
        });

        // Get the file ID for later reference
        const fileId = uploadStream.id;

        // Handle upload events
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
            resolve(fileId.toString());
        });

        // Write file buffer to stream
        uploadStream.write(file);
        uploadStream.end();
    });
}

export async function getFileFromGridFS(fileId: string): Promise<Buffer> {
    const bucket = await getGridFSBucket();
    
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

        downloadStream.on('data', chunk => chunks.push(chunk));
        downloadStream.on('error', reject);
        downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

export async function getFileInfo(fileId: string) {
    const bucket = await getGridFSBucket();
    const db = bucket.s.db;
    
    const file = await db.collection('contracts.files').findOne({
        _id: new ObjectId(fileId)
    });
    
    return file;
}

export async function deleteFileFromGridFS(fileId: string): Promise<void> {
    const bucket = await getGridFSBucket();
    await bucket.delete(new ObjectId(fileId));
}
