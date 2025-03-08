import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    comment: {type: String, required: true},
    parentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null},
    postId: {type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null},
    videoId: {type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: null},
    
}, {timestamps: true});

export default mongoose.model('Comment', commentSchema);