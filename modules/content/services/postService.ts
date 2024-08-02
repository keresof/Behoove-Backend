import mongoose, { Types } from 'mongoose';
import Post, { IPost, IClothingItem } from '../models/post';
import User from '../../user/models/user';

class PostService {
    async createPost(authorId: string, content: string, media?: { type: string; url: string }[]): Promise<IPost> {
        const post = new Post({
            author: new Types.ObjectId(authorId),
            content,
            media
        });
        return await post.save();
    }

    async getPostById(postId: string): Promise<IPost | null> {
        return await Post.findById(postId).populate('author', 'username');
    }

    async likePost(postId: string, userId: string): Promise<IPost | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: new Types.ObjectId(userId) } },
            { new: true }
        );
    }

    async unlikePost(postId: string, userId: string): Promise<IPost | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: new Types.ObjectId(userId) } },
            { new: true }
        );
    }

    async addComment(postId: string, userId: string, content: string): Promise<IPost | null> {
        return await Post.findByIdAndUpdate(
            postId,
            {
                $push: {
                    comments: {
                        author: new Types.ObjectId(userId),
                        content,
                        createdAt: new Date(),
                        likes: [],
                        replies: []
                    }
                }
            },
            { new: true }
        );
    }

    async addReplyToComment(postId: string, commentId: string, userId: string, content: string): Promise<IPost | null> {
        return await Post.findOneAndUpdate(
            { _id: postId, "comments._id": commentId },
            {
                $push: {
                    "comments.$.replies": {
                        author: new Types.ObjectId(userId),
                        content,
                        createdAt: new Date(),
                        likes: []
                    }
                }
            },
            { new: true }
        );
    }

    async likeComment(postId: string, commentId: string, userId: string): Promise<IPost | null> {
        return await Post.findOneAndUpdate(
            { _id: postId, "comments._id": commentId },
            { $addToSet: { "comments.$.likes": new Types.ObjectId(userId) } },
            { new: true }
        );
    }

    async likeReply(postId: string, commentId: string, replyId: string, userId: string): Promise<IPost | null> {
        return await Post.findOneAndUpdate(
            { _id: postId, "comments._id": commentId, "comments.replies._id": replyId },
            { $addToSet: { "comments.$[comment].replies.$[reply].likes": new Types.ObjectId(userId) } },
            {
                arrayFilters: [{ "comment._id": commentId }, { "reply._id": replyId }],
                new: true
            }
        );
    }

    async sharePost(postId: string, userId: string): Promise<IPost | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { shares: new Types.ObjectId(userId) } },
            { new: true }
        );
    }

    async addClothingItem(postId: string, clothingItem: IClothingItem): Promise<IPost | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $push: { clothingItems: clothingItem } },
            { new: true }
        );
    }

    async sendBehooveCoins(postId: string, senderId: string, amount: number): Promise<IPost | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const [sender, post] = await Promise.all([
                User.findById(senderId),
                Post.findById(postId)
            ]);

            if (!sender || !post) {
                throw new Error('Sender or post not found');
            }

            if (sender.behooveCoins < amount) {
                throw new Error('Insufficient behoove coins');
            }

            sender.behooveCoins -= amount;
            await sender.save({ session });

            const recipient = await User.findById(post.author);
            if (!recipient) {
                throw new Error('Post author not found');
            }

            recipient.behooveCoins += amount;
            await recipient.save({ session });

            post.coinTransactions.push({ sender: new Types.ObjectId(senderId), amount, createdAt: new Date() });
            await post.save({ session });

            await session.commitTransaction();
            return post;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getPostsByUser(userId: string, page: number = 1, limit: number = 10): Promise<IPost[]> {
        return await Post.find({ author: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'username');
    }

    async getFeedForUser(userId: string, page: number = 1, limit: number = 10): Promise<IPost[]> {
        // This is a basic implementation. You might want to enhance this based on your app's requirements
        // For example, you might want to fetch posts from users that the current user follows
        return await Post.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'username');
    }
}

export default new PostService();