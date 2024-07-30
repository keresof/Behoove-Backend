import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import User from "../models/user";
import passport from "passport";
import { login, register } from '../controllers/authController';

const router = express.Router();

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
    }
);
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['profile', 'email','name'] }));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
    }
);

router.get('/auth/instagram', passport.authenticate('instagram', { scope: ['profile', 'email'] }));

router.get('/auth/instagram/callback',
    passport.authenticate('instagram', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
    }
);



export default router;