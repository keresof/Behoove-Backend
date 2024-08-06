import express from 'express';
import PostController from '../controllers/postController';
import StoryController from '../controllers/storyController';
import loginRequired from '../../../middleware/loginRequired';
import { usernameRequired } from "../../../middleware/usernameRequired";
import {getMediaInfo, listMedia, uploadMedia} from '../controllers/mediaController';
import { upload } from '../../../middleware/uploadMiddleware';

const router = express.Router();

// Post routes
router.post('/posts/:postId/comments/:commentId/replies/:replyId/like',usernameRequired, loginRequired, PostController.likeReply);
router.post('/posts/:postId/comments/:commentId/reply', usernameRequired,loginRequired, PostController.addReplyToComment);
router.post('/posts/:postId/comments/:commentId/like', usernameRequired,loginRequired, PostController.likeComment);
router.post('/posts/:id/clothing-item',usernameRequired, loginRequired, PostController.addClothingItem);
// router.post('/posts/:id/send-coins',usernameRequired, loginRequired, PostController.sendBehooveCoins);
router.post('/posts/:id/comment',usernameRequired, loginRequired, PostController.addComment);
router.post('/posts/:id/unlike',usernameRequired, loginRequired, PostController.unlikePost);
router.post('/posts/:id/share',usernameRequired, loginRequired, PostController.sharePost);
router.post('/posts/:id/like',usernameRequired, loginRequired, PostController.likePost);
router.get('/posts/:id',usernameRequired, PostController.getPost);
router.post('/posts',usernameRequired, loginRequired, PostController.createPost);
router.get('/posts/user/:userId',usernameRequired, PostController.getPostsByUser);
router.get('/feed',usernameRequired, loginRequired, PostController.getFeedForUser);

// Story routes
router.post('/stories/:id/clothing-item',usernameRequired, loginRequired, StoryController.addClothingItem);
router.post('/stories/:id/reaction',usernameRequired, loginRequired, StoryController.addReaction);
router.delete('/stories/:id/reaction',usernameRequired, loginRequired, StoryController.removeReaction);
router.post('/stories/:id/view',usernameRequired, loginRequired, StoryController.viewStory);
router.get('/stories/:id/viewer-count', usernameRequired,StoryController.getViewerCount);
router.get('/stories/:id/reaction-counts',usernameRequired, StoryController.getReactionCounts);
router.delete('/stories/:id',usernameRequired, loginRequired, StoryController.deleteStory);
router.get('/stories/:id',usernameRequired, StoryController.getStory);
router.get('/stories/user/:userId',usernameRequired, StoryController.getUserStories);
router.get('/stories/feed',usernameRequired, loginRequired, StoryController.getFeedStories);
router.post('/stories',usernameRequired, loginRequired, StoryController.createStory);

//  Upload routes
router.post('/upload', loginRequired, usernameRequired, upload.single('media'), uploadMedia);
router.get('/media', loginRequired, listMedia);
router.get('/media/:fileKey', loginRequired, getMediaInfo);
export default router;