import Comment from '../model/comment.js';
import Post from '../model/post.js';

export const createComment = async (req, res) => {
    try {
        const {postId} = req.params;
        const {comment, parentId} = req.body;
        
        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({message: "Post not found"});
        }
        const newComment = new Comment({
            userId: req.user.id,
            comment,
            parentId: parentId || null,
            postId: postId,
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const getCommentsByPostId = async (req, res) => {
    try {
        const {postId} = res.params;
        const comments = await Comment.find({postId})
        .populate('userId', 'username profilePicture')
        .sort({createAt: -1});
        res.status(200).json(comments)
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

export const updateComment = async (req, res) => {
    try {

        const {id} = req.params;
        const {comment} = req.body;
    
        const updatedComment = await Comment.findByIdAndUpdate(
            id, 
            {comment},
            {new: true}
        ).populate('userId', 'username profilePicture')
    
        if(!updateComment) {
            return res.status(404).json({message: "Comment not found"})
        }
        if(updateComment.userId.toString()!== req.user.id) {
            return res.status(403).json({message: "You can only update your own comments"})
        }
        res.status(200).json(updateComment)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const deleteComment = async (req, res) => {
    try {
        const {id} = req.params;
        const comment = await Comment.findById(id);
        if(!comment) {
            res.status(404).json({message: "Comment not found"});
        }
        if(comment.userId.toString() !== req.user.id) {
            res.status(403).json({message: "You can only delete your own comments"})
        }
        await comment.deleteOne();
        res.status(200).json({message: "Comment deleted successfully"})
    } catch (error) {

    } 
}
