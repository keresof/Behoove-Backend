import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as InstagramStrategy } from "passport-instagram";

import  User  from "../modules/user/models/user";
import userService from "../modules/user/services/userService";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await User.findOne({ email: profile.emails?.[0].value });
            if(user){
                if(user.googleId !== profile.id){
                    return done(null, false, { message: 'Google ID mismatch' });
                }
                return done(null, user);
            }
            const newUser = await userService.createUser(profile.emails?.[0].value!, undefined, undefined, profile.id);
            if(!newUser){
                return done(null, false, { message: 'Error creating user' });
            }
            return done(null, newUser);
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
            callbackURL: process.env.FACEBOOK_CALLBACK_URL || "",
            profileFields: ['id', 'emails', 'name']
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await User.findOne({ email: profile.emails?.[0].value });
            if(user){
                if(user.facebookId !== profile.id){
                    return done(null, false, { message: 'Facebook ID mismatch' });
                }
                return done(null, user);
            }
            const newUser = await userService.createUser(profile.emails?.[0].value!, undefined, undefined, undefined, profile.id);
            if(!newUser){
                return done(null, false, { message: 'Error creating user' });
            }
            return done(null, newUser);
        }
    )
);

passport.use(
    new InstagramStrategy(
        {
            clientID: process.env.INSTAGRAM_CLIENT_ID || "",
            clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
            callbackURL: process.env.INSTAGRAM_CALLBACK_URL || "",
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await User.findOne({ email: profile.username });
            if(user){
                if(user.instagramId !== profile.id){
                    return done(new Error("Instagram ID mismatch"), false);
                }
                return done(null, user);
            }
            const newUser = await userService.createUser(profile.username!, undefined, undefined, undefined, undefined, profile.id);
            if(!newUser){
                return done(new Error("Error creating user"), false);
            }
            return done(null, newUser);
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});