import express, {Request, Response, NextFunction } from 'express';
import { login, register, socialCallback, socialInit } from '../controllers/authController';
import passport from 'passport';

const router = express.Router();

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

// Social login routes
router.get('/:provider', socialInit);
// router.get('/:provider/callback', async (req,res)=>{
//     const provider = req.params.provider;
//     return passport.authenticate(provider.toLowerCase(), { session: false, failureRedirect: '/login' })(req,res);
// }, socialCallback);
router.get('/:provider/callback', (req:Request, res: Response, next:NextFunction) => {
    const provider = req.params.provider.toLowerCase();
    passport.authenticate(provider, { session: false, failureRedirect: '/login' })(req, res, next);
  }, socialCallback);


export default router;