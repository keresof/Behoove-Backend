import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import User from '../model/user';
import { IUser } from '../../../interfaces/IUser';
import { Document } from 'mongoose';

type SocialProvider = 'google' | 'facebook' | 'instagram';

const createOrUpdateUser = async (profile: any, provider: SocialProvider): Promise<IUser & Document> => {
    const email = profile.emails && profile.emails[0]?.value;
    const displayName = profile.displayName || 'Unknown';
    const providerId = profile.id;

    if (!email && !providerId) {
        throw new Error(`Unable to retrieve email or ID from ${provider} profile`);
    }

    let user: (IUser & Document) | null = null;

    if (email) {
        user = await User.findOne({ email });
    }

    if (!user && providerId) {
        user = await User.findOne({ [`${provider}Id`]: providerId });
    }

    if (!user) {
        user = new User({
            email,
            username: email ? email.split('@')[0] : `${provider}User${Date.now()}`,
            password: Math.random().toString(36).slice(-8), // Generate a random password
            [`${provider}Id`]: providerId,
        });
    } else {
        user.set(`${provider}Id`, providerId);
    }

    await user.save();
    return user;
};

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await createOrUpdateUser(profile, 'google');
            return done(null, user);
        } catch (error) {
            return done(error as Error);
        }
    }));

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID as string,
        clientSecret: process.env.FACEBOOK_APP_SECRET as string,
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'emails', 'name']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await createOrUpdateUser(profile, 'facebook');
            return done(null, user);
        } catch (error) {
            return done(error as Error);
        }
    }));

passport.use(new InstagramStrategy({
        clientID: process.env.INSTAGRAM_CLIENT_ID as string,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET as string,
        callbackURL: "/auth/instagram/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await createOrUpdateUser(profile, 'instagram');
            return done(null, user);
        } catch (error) {
            return done(error as Error);
        }
    }));

passport.serializeUser((user: Express.User, done) => {
    done(null, (user as IUser & Document)._id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;