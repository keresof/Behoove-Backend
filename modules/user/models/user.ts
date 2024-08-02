import * as mongoose from "mongoose";
import { hash, compare } from "../../../utilities/cryptoService";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v: string) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: (props: { value: string }) => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
    },
    behooveCoins: {
        type: Number,
        default: 0
    },
    // Add these fields for social authentication
    googleId: { type: String, sparse: true, unique: true },
    facebookId: { type: String, sparse: true, unique: true },
    instagramId: { type: String, sparse: true, unique: true },
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

function validatePassword(password: string) {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        if (!validatePassword(this.password)) {
            throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long');
        }

        // Hash the password
        this.password = await hash(this.password);
        next();
    } catch (err: any) {
        return next(err);
    }
});


userSchema.methods.verifyPassword = async function(candidatePassword: string) {
    return compare(candidatePassword, this.password);
};

export interface IUserMethods {
    verifyPassword(candidatePassword: string): Promise<boolean>;
}

export interface IUser extends mongoose.Document, IUserMethods {
    email: string;
    password: string;
    behooveCoins: number;
    googleId?: string;
    facebookId?: string;
    instagramId?: string;
}

export default mongoose.model<IUser>('User', userSchema);