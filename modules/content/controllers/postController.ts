import { Request, Response } from 'express';
import PostService from '../services/postService';
import { IUser } from '../../user/models/user';
import { sendError } from '../../../utilities/utils';

const PostController = {
    async createPost(req: Request, res: Response) {
        try {
            const {content, media, items} = req.body;
            const user = req.user as IUser;
            const post = await PostService.createPost(user.id, content, media, items);
            res.status(201).json(post);
        } catch (error) {
            sendError(res, error);
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
            sendError(res, error);
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
            sendError(res, error);
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
            sendError(res, error);
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
            sendError(res, error);
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
            sendError(res, error);
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
            sendError(res, error);
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
            sendError(res, error);
        }
    },
    async sharePost(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const toUser = req.body.toUser;
            const post = await PostService.sharePost(req.params.id, user.id, toUser);
            if (!post) {
                return res.status(404).json({message: 'Post not found'});
            }
            res.json(post);
        } catch (error) {
            sendError(res, error);
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
            sendError(res, error);
        }
    },

    async getPostsByUser(req: Request, res: Response) {
        try {
            const {userId} = req.params;
            const {page = '1', limit = '10'} = req.query;
            const posts = await PostService.getPostsByUser(userId, parseInt(page as string), parseInt(limit as string));
            res.json(posts);
        } catch (error) {
            sendError(res, error);
        }
    },
    async getFeedForUser(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const {page = '1', limit = '10'} = req.query;
            const posts = await PostService.getFeedForUser(user.id, parseInt(page as string), parseInt(limit as string));
            res.json(posts);
        } catch (error) {
            sendError(res, error);
        }
    },
}

export default PostController;