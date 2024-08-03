import { Request, Response } from 'express';
import PostService from '../services/postService';
import { IUser } from '../../user/models/user';

const PostController = {
    async createPost(req: Request, res: Response) {
        try {
            const {content, media} = req.body;
            const user = req.user as IUser;
            const post = await PostService.createPost(user.id, content, media);
            res.status(201).json(post);
        } catch (error) {
            res.status(500).json({message: 'Error creating post', error: (error as Error).message});
        }
    },
    async getPost(req: Request, res: Response) {
        try {
            const post = await PostService.getPostById(req.params.id);
            if (!post) {
                return res.status(404).json({message: 'Post not found'})
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error getting post', error: (error as Error).message});
        }
    },
    async likePost(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const post = await PostService.likePost(req.params.id, user.id);
            if (!post) {
                return res.status(404).json({message: 'Post not found'})
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error liking post', error: (error as Error).message});
        }
    },
    async unlikePost(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const post = await PostService.unlikePost(req.params.id, user.id);
            if (!post) {
                return res.status(404).json({message: 'Post not found'})
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error unliking post', error: (error as Error).message});
        }
    },
    async addComment(req: Request, res: Response) {
        try {
            const {content} = req.body
            const user = req.user as IUser;
            const post = await PostService.addComment(req.params.id, user.id, content);
            if (!post) {
                return res.status(404).json({message: 'Post not found'})
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error adding comment', error: (error as Error).message});
        }
    },
    async addReplyToComment(req: Request, res: Response) {
        try {
            const {content} = req.body;
            const {postId, commentId} = req.params;
            const user = req.user as IUser;
            const post = await PostService.addReplyToComment(postId, commentId, user.id, content);
            if (!post) {
                return res.status(404).json({message: 'Post not found'})
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error adding reply to comment', error: (error as Error).message});
        }
    },
    async likeComment(req: Request, res: Response) {
        try {
            const {postId, commentId} = req.params;
            const user = req.user as IUser;
            const post = await PostService.likeComment(postId, commentId, user.id);
            if (!post) {
                return res.status(404).json({message: 'Post or comment not found'});
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error liking comment', error: (error as Error).message});
        }
    },

    async likeReply(req: Request, res: Response) {
        try {
            const {postId, commentId, replyId} = req.params;
            const user = req.user as IUser;
            const post = await PostService.likeReply(postId, commentId, replyId, user.id);
            if (!post) {
                return res.status(404).json({message: 'Post, comment, or reply not found'});
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error liking reply', error: (error as Error).message});
        }
    },
    async sharePost(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const post = await PostService.sharePost(req.params.id, user.id);
            if (!post) {
                return res.status(404).json({message: 'Post not found'});
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error sharing post', error: (error as Error).message});
        }
    },
    async addClothingItem(req: Request, res: Response) {
        try {
            const {clothingItem} = req.body;
            const post = await PostService.addClothingItem(req.params.id, clothingItem);
            if (!post) {
                return res.status(404).json({message: 'Post not found'});
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error adding clothing item', error: (error as Error).message});
        }
    },
    async sendBehooveCoins(req: Request, res: Response) {
        try {
            const {amount} = req.body;
            const user = req.user as IUser;
            const post = await PostService.sendBehooveCoins(req.params.id, user.id, amount);
            if (!post) {
                return res.status(404).json({message: 'Post not found'});
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({message: 'Error sending behoove coins', error: (error as Error).message});
        }
    },
    async getPostsByUser(req: Request, res: Response) {
        try {
            const {userId} = req.params;
            const {page = '1', limit = '10'} = req.query;
            const posts = await PostService.getPostsByUser(userId, parseInt(page as string), parseInt(limit as string));
            res.json(posts);
        } catch (error) {
            res.status(500).json({message: 'Error fetching user posts', error: (error as Error).message});
        }
    },
    async getFeedForUser(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const {page = '1', limit = '10'} = req.query;
            const posts = await PostService.getFeedForUser(user.id, parseInt(page as string), parseInt(limit as string));
            res.json(posts);
        } catch (error) {
            res.status(500).json({message: 'Error fetching feed', error: (error as Error).message});
        }
    },
}

export default PostController;