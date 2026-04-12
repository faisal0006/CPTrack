import mongoose from 'mongoose';

const problemLogSchema = new mongoose.Schema<any>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemName: {
        type: String,
        required: true
    },
    difficulty: {
        type: Number,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true
    },
    solvedDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.model('ProblemLog', problemLogSchema);
