import { Request, Response } from 'express';
import { IUser } from '../../user/models/user';
import {getSignedUrlForKey} from "../../../middleware/uploadMiddleware";
import Media from "../models/media";


export const uploadMedia = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const file = req.file as Express.MulterS3.File;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const media = new Media({
            fileKey: file.key,
            fileType: file.mimetype,
            uploadedBy: user.id,
            size: file.size,
        });

        await media.save();

        const signedUrl = await getSignedUrlForKey(file.key);

        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl: signedUrl,
            fileKey: file.key,
            fileType: file.mimetype.startsWith('image/') ? 'image' : 'video'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error: (error as Error).message });
    }
};

export const getMediaInfo = async (req: Request, res: Response) => {
    try {
        const { fileKey } = req.params;
        const signedUrl = await getSignedUrlForKey(fileKey);

        res.status(200).json({
            fileKey,
            fileUrl: signedUrl
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving file information', error: (error as Error).message });
    }
};

export const listMedia = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { page = 1, limit = 10, type, fileName } = req.query;

        const query: any = { user: user.id };

        if (type) {
            query.type = type;
        }

        if (fileName) {
            query.$text = { $search: fileName as string };
        }

        const options = {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            sort: { createdAt: -1 },
            populate: [{ path: 'user' }]
        };

        const result = await Media.paginate(query, options);

        res.status(200).json({
            media: result.docs,
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.totalDocs,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error listing media', error: (error as Error).message });
    }
};