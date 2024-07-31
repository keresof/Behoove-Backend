import express, { NextFunction } from 'express';
import { login, register, socialCallback, socialInit } from '../controllers/authController';
import passport from 'passport';

const router = express.Router();

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

// Social login routes
router.get('/oauth/:provider', socialInit);
router.get('/oauth/:provider/callback', async (req,res)=>{
    const provider = req.params.provider;
    return passport.authenticate(provider.toLowerCase(), { session: false, failureRedirect: '/login' })(req,res);
}, socialCallback);



export default router;