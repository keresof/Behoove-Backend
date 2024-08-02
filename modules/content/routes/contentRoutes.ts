import express from 'express';
import PostController from '../controllers/postController';
import StoryController from '../controllers/storyController';
import loginRequired from '../../../middleware/loginRequired';

const router = express.Router();

// Post routes
router.post('/posts/:postId/comments/:commentId/replies/:replyId/like', loginRequired, PostController.likeReply);
router.post('/posts/:postId/comments/:commentId/reply', loginRequired, PostController.addReplyToComment);
router.post('/posts/:postId/comments/:commentId/like', loginRequired, PostController.likeComment);
router.post('/posts/:id/clothing-item', loginRequired, PostController.addClothingItem);
router.post('/posts/:id/send-coins', loginRequired, PostController.sendBehooveCoins);
router.post('/posts/:id/comment', loginRequired, PostController.addComment);
router.post('/posts/:id/unlike', loginRequired, PostController.unlikePost);
router.post('/posts/:id/share', loginRequired, PostController.sharePost);
router.post('/posts/:id/like', loginRequired, PostController.likePost);
router.get('/posts/:id', PostController.getPost);
router.post('/posts', loginRequired, PostController.createPost);
router.get('/posts/user/:userId', PostController.getPostsByUser);
router.get('/feed', loginRequired, PostController.getFeedForUser);

// Story routes
router.post('/stories/:id/clothing-item', loginRequired, StoryController.addClothingItem);
router.post('/stories/:id/reaction', loginRequired, StoryController.addReaction);
router.delete('/stories/:id/reaction', loginRequired, StoryController.removeReaction);
router.post('/stories/:id/view', loginRequired, StoryController.viewStory);
router.get('/stories/:id/viewer-count', StoryController.getViewerCount);
router.get('/stories/:id/reaction-counts', StoryController.getReactionCounts);
router.delete('/stories/:id', loginRequired, StoryController.deleteStory);
router.get('/stories/:id', StoryController.getStory);
router.get('/stories/user/:userId', StoryController.getUserStories);
router.get('/stories/feed', loginRequired, StoryController.getFeedStories);
router.post('/stories', loginRequired, StoryController.createStory);

export default router;