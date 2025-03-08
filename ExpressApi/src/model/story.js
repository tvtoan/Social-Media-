import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    text: { type: String, max: 100 },
}, {timestamps: true });

export default mongoose.model('Story', storySchema);