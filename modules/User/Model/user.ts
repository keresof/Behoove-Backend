import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";

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
        required: true,
    }
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
    if (!this.isModified('password')) {
        return next();
    }
    try {
        if (!validatePassword(this.password)) {
            throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

        next();
    } catch (err: any) {
        return next(err);
    }
});

// Add a method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;