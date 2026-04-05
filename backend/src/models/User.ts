import mongoose from 'mongoose';

const userSchema = new mongoose.Schema<any>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    currentRating: {
        type: Number,
        default: 0
    },
    targetRating: {
        type: Number,
        default: 0
    },
    dailyGoal: {
        type: Number,
        default: 1
    },
    streak: {
        type: Number,
        default: 0
    },
    codeforcesHandle: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);
