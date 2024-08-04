import mongoose, { Types } from 'mongoose';
import Story, { IStory } from '../models/story';
import Media from '../models/media';

class StoryService {
    async createStory(authorId: string, media: string[], caption?: string, items?: string[]): Promise<IStory> {
        const story = new Story({
            author: new Types.ObjectId(authorId),
            media: media.map(mediaId => new Types.ObjectId(mediaId)),
            caption,
            items: items?.map(item => new Types.ObjectId(item))
        });
        return await story.save();
    }

    async getStoryById(storyId: string): Promise<IStory | null> {
        return await Story.findById(storyId)
            .populate('author', 'username')
            .populate('media')
            .populate('items');
    }

    async getUserStories(userId: string): Promise<IStory[]> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return await Story.find({
            author: new Types.ObjectId(userId),
            createdAt: { $gte: twentyFourHoursAgo }
        })
        .sort('-createdAt')
        .populate('author', 'media')
        .populate('media')
        .populate('items');
    }

    async getFeedStories(userId: string): Promise<IStory[]> {
        // This is a basic implementation. You might want to enhance this to fetch stories from users that the current user follows
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return await Story.find({
            createdAt: { $gte: twentyFourHoursAgo }
        })
        .sort('-createdAt')
        .populate('author', 'media')
        .populate('media')
        .populate('items');
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

    async likeStory(storyId: string, userId: string): Promise<IStory | null> {
        const story = await Story.findById(storyId);
        if (!story) return null;
        await story.likeStory(new Types.ObjectId(userId));
        return story;
    }

    async unlikeStory(storyId: string, userId: string): Promise<IStory | null> {
        const story = await Story.findById(storyId);
        if (!story) return null;
        await story.unlikeStory(new Types.ObjectId(userId));
        return story;
    }

    async addReaction(storyId: string, userId: string, reaction: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'): Promise<IStory | null> {
        const story = await Story.findById(storyId);
        if (!story) return null;
        await story.addReaction(new Types.ObjectId(userId), reaction);
        return story;
    }

    async removeReaction(storyId: string, userId: string): Promise<IStory | null> {
        const story = await Story.findById(storyId);
        if (!story) return null;
        await story.removeReaction(new Types.ObjectId(userId));
        return story;
    }

    async addItem(storyId: string, itemId: string): Promise<IStory | null> {
        return await Story.findByIdAndUpdate(
            storyId,
            { $addToSet: { items: new Types.ObjectId(itemId) } },
            { new: true }
        );
    }

    async removeItem(storyId: string, itemId: string): Promise<IStory | null> {
        return await Story.findByIdAndUpdate(
            storyId,
            { $pull: { items: new Types.ObjectId(itemId) } },
            { new: true }
        );
    }

    async deleteStory(storyId: string, userId: string): Promise<IStory | null> {
        return await Story.findOneAndDelete({ _id: storyId, author: new Types.ObjectId(userId) });
    }

    async getViewerCount(storyId: string): Promise<number> {
        const story = await Story.findById(storyId);
        return story ? story.viewersCount : 0;
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

    async getLikesCount(storyId: string): Promise<number> {
        const story = await Story.findById(storyId);
        return story ? story.likesCount : 0;
    }
}

export default new StoryService();