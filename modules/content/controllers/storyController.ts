import { Request, Response } from 'express';
import StoryService from '../services/storyService';
import { IUser } from '../../user/models/user';
import { sendError } from '../../../utilities/utils';

class StoryController {
    async createStory(req: Request, res: Response) {
        try {
            const { media, caption, clothingItems } = req.body;
            const user = req.user as IUser;
            const story = await StoryService.createStory(user.id, media, caption, clothingItems);
            res.status(201).json(story);
        } catch (error) {
            sendError(res, error);
        }
    }

    async getStory(req: Request, res: Response) {
        try {
            const story = await StoryService.getStoryById(req.params.id);
            if (!story) {
                return res.status(404).json({ message: 'Story not found' });
            }
            res.json(story);
        } catch (error) {
            sendError(res, error);
        }
    }

    async getUserStories(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const stories = await StoryService.getUserStories(userId);
            res.json(stories);
        } catch (error) {
            sendError(res, error);
        }
    }

    async getFeedStories(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const stories = await StoryService.getFeedStories(user.id);
            res.json(stories);
        } catch (error) {
            sendError(res, error);
        }
    }

    async viewStory(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const story = await StoryService.viewStory(req.params.id, user.id);
            if (!story) {
                return res.status(404).json({ message: 'Story not found' });
            }
            res.json(story);
        } catch (error) {
            sendError(res, error);
        }
    }

    async addReaction(req: Request, res: Response) {
        try {
            const { reaction } = req.body;
            const user = req.user as IUser;
            const story = await StoryService.addReaction(req.params.id, user.id, reaction);
            if (!story) {
                return res.status(404).json({ message: 'Story not found' });
            }
            res.json(story);
        } catch (error) {
            sendError(res, error);
        }
    }

    async removeReaction(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const story = await StoryService.removeReaction(req.params.id, user.id);
            if (!story) {
                return res.status(404).json({ message: 'Story not found' });
            }
            res.json(story);
        } catch (error) {
            sendError(res, error);
        }
    }

    async addClothingItem(req: Request, res: Response) {
        try {
            const { clothingItem } = req.body;
            const story = await StoryService.addItem(req.params.id, clothingItem);
            if (!story) {
                return res.status(404).json({ message: 'Story not found' });
            }
            res.json(story);
        } catch (error) {
            sendError(res, error);
        }
    }

    async deleteStory(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const story = await StoryService.deleteStory(req.params.id, user.id);
            if (!story) {
                return res.status(404).json({ message: 'Story not found or unauthorized' });
            }
            res.json({ message: 'Story deleted successfully' });
        } catch (error) {
            sendError(res, error);
        }
    }

    async getViewerCount(req: Request, res: Response) {
        try {
            const count = await StoryService.getViewerCount(req.params.id);
            res.json({ viewerCount: count });
        } catch (error) {
            sendError(res, error);
        }
    }

    async getReactionCounts(req: Request, res: Response) {
        try {
            const counts = await StoryService.getReactionCounts(req.params.id);
            res.json(counts);
        } catch (error) {
            sendError(res, error);
        }
    }
}

export default new StoryController();