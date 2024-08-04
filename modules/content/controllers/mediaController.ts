import { Request, Response } from 'express';
import { IUser } from '../../user/models/user';
import {getSignedUrlForKey} from "../../../middleware/uploadMiddleware";

export const uploadMedia = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const file = req.file as Express.MulterS3.File;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

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