import Video from "../model/video";

export const uploadVideo = async(req, res) => {

    
    if(!req.file) {
        res.status(400).json({message: 'No video file upload! '});
    }

    let comments = [];

    if(req.body.comments) {
        try {
            comments = JSON.parse(req.body.comments).map(comment => ({
                userId: req.user.id,
                comment: comment.comment
            }))
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    }
    const newVideo = new Video({
        userId: req.user.id,
        videoPath: req.file.path,
        description: req.body.description, 
        likes: req.body.likes ,
        comments: comments 
    });

    try {
        const savedVideo = await newVideo.save();
        res.status(201).json(savedVideo);
    } catch(error) {
        res.status(500).json({ message: error.message});
    }
    
};

export const addComment = async (req, res) => {
    const {id: videoId} = req.params;
    const {comment } = req.body;

    try {
        const video = await Video.findById(videoId);
        if(!video) {
            return res.status(404).json({message: "Video not found"});
        }

        const newComment = {
            userId: req.user.id,
            comment: comment,
            createAt: new Date(),
        };

        video.comments.push(newComment);
        await video.save();

        //update video after add comment
        const updatedVideo = await Video.findById(videoId).populate({
            path: "comments.userId",
            select: "username profilePicture"
        })
        res.status(200).json(updatedVideo);
    }  catch(error) {
        res.status(500).json({message: error.message});
    }
};

export const getVideo = async(req, res) => {
    try {
        const video = await Video.findById(req.params.id)
        .populate('userId', 'username profilePicture')
        .populate('comments.userId', 'username profilePicture');
        if(!video) {
            res.status(404).json({message: 'Video not found'});
        }
        res.status(200).json(video)
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

export const getVideos = async(req, res) => {
    try {
        const videos = await Video.find()
        .populate('userId', 'username profilePicture')
        .populate('comments.userId', 'username profilePicture')
        .limit(10);
        res.status(200).json(videos)
    } catch( error) {
        res.status(500).json({message: error.message})
    }
}



export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if(!video) {
            res.status(404).json({message: 'Video not found'});
        }
        if(Video.userId.toString() !== req.user.id) {
            res.status(403).json({message: 'You cannot delete this video'});
        }
        await Video.deleteOne();
        res.status(200).json({message: 'Deleted success'});
    } catch(error) {
        res.status(500).json({message: error.message })
    }
};





