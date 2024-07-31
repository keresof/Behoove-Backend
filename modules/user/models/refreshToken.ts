import mongoose from "mongoose";
import { REFRESH_TOKEN_EXPIRATION } from "../../../utilities/constants";
import { randomBytes } from "crypto";
import { compare, hash } from "../../../utilities/cryptoService";

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdByIp: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    revoked:{
        type : Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ createdAt: 1 });

refreshTokenSchema.pre('save', async function (next) {
    if(this.isModified('token') && this.token) {
        this.token = await hash(this.token);
    }
    next();
});

refreshTokenSchema.statics.deleteExpired = async function () {
    await this.deleteMany({
        createdAt: { $lte: new Date(Date.now() - (REFRESH_TOKEN_EXPIRATION * 1000)) }
    });
};


refreshTokenSchema.statics.generateToken = async function() {
    return randomBytes(24).toString('hex');
};

refreshTokenSchema.methods.isExpired = function() {
    return this.createdAt <= new Date(Date.now() - (REFRESH_TOKEN_EXPIRATION * 1000));
};

refreshTokenSchema.methods.isValid = function() {
    return !this.isExpired() && !this.revoked;
}

refreshTokenSchema.methods.validateToken = async function(candidateToken: string) {
    return this.isValid && await compare(candidateToken, this.token);
}

refreshTokenSchema.methods.revoke = function() {
    this.revoked = true;
    return this.save();
}

export interface IRefreshToken extends mongoose.Document {
    token: string;
    user: mongoose.Schema.Types.ObjectId;
    createdByIp: string;
    userAgent: string;
    revoked: boolean;
    isExpired(): boolean;
    isValid(): boolean;
    revoke(): Promise<IRefreshToken>;
    validateToken(candidateToken: string): Promise<boolean>;
}

export interface IRefreshTokenModel extends mongoose.Model<IRefreshToken> {
    deleteExpired(): Promise<void>;
    generateToken(): Promise<string>;
}

export default mongoose.model<IRefreshToken, IRefreshTokenModel>('RefreshToken', refreshTokenSchema);