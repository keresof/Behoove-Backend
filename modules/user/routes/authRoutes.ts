import express, { NextFunction } from 'express';
import { login, register, socialCallback, socialInit } from '../controllers/authController';

const router = express.Router();

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

// Social login routes
router.get('/oauth/{provider}', socialInit);
router.get('/oauth/{provider}/callback', socialCallback);



export default router;