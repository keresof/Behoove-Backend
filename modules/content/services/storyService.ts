import mongoose, { Types } from 'mongoose';
import Story, { IStory, IClothingItem } from '../models/story';
import User from '../../user/models/user';

class StoryService {
    async createStory(authorId: string, media: { type: 'image' | 'video', url: string }, caption?: string, clothingItems?: IClothingItem[]): Promise<IStory> {
        const story = new Story({
            author: new Types.ObjectId(authorId),
            media,
            caption,
            clothingItems
        });
        return await story.save();
    }

    async getStoryById(storyId: string): Promise<IStory | null> {
        return await Story.findById(storyId).populate('author', 'username');
    }

    async getUserStories(userId: string): Promise<IStory[]> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return await Story.find({
            author: new Types.ObjectId(userId),
            createdAt: { $gte: twentyFourHoursAgo }
        }).sort('-createdAt').populate('author', 'username');
    }

    async getFeedStories(userId: string): Promise<IStory[]> {
        // This is a basic implementation. You might want to enhance this to fetch stories from users that the current user follows
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return await Story.find({
            createdAt: { $gte: twentyFourHoursAgo }
        }).sort('-createdAt').populate('author', 'username');
    }

    async viewStory(storyId: string, viewerId: string): Promise<IStory | null> {
        return await Story.findByIdAndUpdate(
            storyId,
            {
                $addToSet: {
                    viewers: {
                        user: new Types.ObjectId(viewerId),
                        viewedAt: new Date()
                    }
                }
            },
            { new: true }
        );
    }

    async addReaction(storyId: string, userId: string, reaction: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'): Promise<IStory | null> {
        return await Story.findByIdAndUpdate(
            storyId,
            {
                $addToSet: {
                    reactions: {
                        user: new Types.ObjectId(userId),
                        reaction
                    }
                }
            },
            { new: true }
        );
    }

    async removeReaction(storyId: string, userId: string): Promise<IStory | null> {
        return await Story.findByIdAndUpdate(
            storyId,
            { $pull: { reactions: { user: new Types.ObjectId(userId) } } },
            { new: true }
        );
    }

    async addClothingItem(storyId: string, clothingItem: IClothingItem): Promise<IStory | null> {
        return await Story.findByIdAndUpdate(
            storyId,
            { $push: { clothingItems: clothingItem } },
            { new: true }
        );
    }

    async deleteStory(storyId: string, userId: string): Promise<IStory | null> {
        return await Story.findOneAndDelete({ _id: storyId, author: new Types.ObjectId(userId) });
    }

    async getViewerCount(storyId: string): Promise<number> {
        const story = await Story.findById(storyId);
        return story ? story.viewers.length : 0;
    }

    async getReactionCounts(storyId: string): Promise<Record<string, number>> {
        const story = await Story.findById(storyId);
        if (!story) return {};

        const counts: Record<string, number> = {
            like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0
        };

        story.reactions.forEach(reaction => {
            counts[reaction.reaction]++;
        });

        return counts;
    }
}

export default new StoryService();