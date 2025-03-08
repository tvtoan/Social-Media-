import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    videoPath: { type: String, required: true },  // link save video
    description: { type: String, max:500 },
    likes: { type: Array, default: [] },
    comments:[ {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String, require: true },
        createAt: { type: Date, default: Date.now },
    }]

}, {timestamps: true});

export default mongoose.model('Video', videoSchema);