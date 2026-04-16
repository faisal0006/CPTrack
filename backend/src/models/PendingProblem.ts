import mongoose from 'mongoose';

const pendingProblemSchema = new mongoose.Schema<any>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemName: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: false
    },
    difficulty: {
        type: Number,
        required: false
    },
    topic: {
        type: String,
        required: false
    },
    platform: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const PendingProblem = mongoose.model('PendingProblem', pendingProblemSchema);

export default PendingProblem;
