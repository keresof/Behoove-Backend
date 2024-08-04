import { Types } from 'mongoose';
import Post, { IPost } from '../models/post';
import { IItem } from '../../clothing/models/item';

class PostService {
    async createPost(authorId: string, content: string, media: string[], items: string[]): Promise<IPost | null> {
        return await Post.create({
            author: new Types.ObjectId(authorId),
            content,
            media: media.map((m) => new Types.ObjectId(m)),
            items: items.map((i) => new Types.ObjectId(i)),
            likes: [],
            comments: [],
            shares: []
        });
    }

    async getPostById(postId: string): Promise<IPost | null> {
        return await Post.findById(postId).populate('author', 'media');
    }

    async likePost(postId: string, userId: string): Promise<IPost | null> {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        return await post.likePost(new Types.ObjectId(userId));
    }

    async unlikePost(postId: string, userId: string): Promise<IPost | null> {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        return await post.unlikePost(new Types.ObjectId(userId));
    }

    async addComment(postId: string, userId: string, content: string): Promise<IPost | null> {
        const post = await Post.findById(new Types.ObjectId(postId));
        if (!post) {
            throw new Error('Post not found');
        }
        return await post.addComment({
            author: new Types.ObjectId(userId),
            content,
            createdAt: new Date(),
            likes: [],
            replies: []
        });
    }

    async addReplyToComment(postId: string, commentId: string, userId: string, content: string): Promise<IPost | null> {
        const post = await Post.findById(new Types.ObjectId(postId));
        if (!post) {
            throw new Error('Post not found');
        }
        return await post.addReply(new Types.ObjectId(commentId), {
            author: new Types.ObjectId(userId),
            content,
            createdAt: new Date(),
            likes: []
        });
    }

    async likeComment(postId: string, commentId: string, userId: string): Promise<IPost | null> {
        const post = await Post.findById(new Types.ObjectId(postId));
        if (!post) {
            throw new Error('Post not found');
        }
        return await post.likeComment(new Types.ObjectId(commentId), new Types.ObjectId(userId));
    }

    async likeReply(postId: string, commentId: string, replyId: string, userId: string): Promise<IPost | null> {
        const post = await Post.findById(new Types.ObjectId(postId));
        if (!post) {
            throw new Error('Post not found');
        }
        return await post.likeReply(new Types.ObjectId(commentId), new Types.ObjectId(replyId), new Types.ObjectId(userId));
    }

    async sharePost(postId: string, fromId: string, toId: string): Promise<IPost | null> {
        const post = await Post.findById(new Types.ObjectId(postId));
        if (!post) {
            throw new Error('Post not found');
        }
        return await post.sharePost(new Types.ObjectId(fromId), new Types.ObjectId(toId));
    }

    async addClothingItem(postId: string, clothingItem: IItem): Promise<IPost | null> {
        const post = await Post.findById(new Types.ObjectId(postId));
        if (!post) {
            throw new Error('Post not found');
        }
        return await post.addItem(new Types.ObjectId((clothingItem.id as string)));
    }

    async getPostsByUser(userId: string, page: number = 1, limit: number = 10): Promise<IPost[]> {
        return await Post.find({ author: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'media');
    }

    async getFeedForUser(userId: string, page: number = 1, limit: number = 10): Promise<IPost[]> {
        // This is a basic implementation. You might want to enhance this based on your app's requirements
        // For example, you might want to fetch posts from users that the current user follows
        return await Post.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'media');
    }
}

export default new PostService();