import Story from "../model/story";

export const createStory = async (req, res) => {

   
    const newStory = new Story({
        userId: req.user.id,
        image: req.file ? `/uploadStories/${req.file.filename}`: null,
        text: req.body.text,
        
    });

    try {
        const savedStory = await newStory.save();
        res.status(201).json(savedStory);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

export const getStories = async (req, res) => {
    try {
        const stories = await Story.find().populate('userId', 'username profilePicture');
        res.status(200).json(stories);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

export const getStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id).populate('userId', 'username profilePicture');
        
        if(!story) {
            return res.status(404).json({message: 'Story not found'});
        }
        if(!story.userId) {
            story.userId = {
                username:"Unknown User",
            };
        }
        res.status(200).json(story);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const deleteStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        
        if(!story) {
            return res.status(404).json({message: 'Story not found'});
        }

        if(story.userId.toString() === req.user.id) {
            await story.deleteOne();
            res.status(200).json({message: 'Story deleted'});
        } else {
            res.status(403).json({message: 'You can delete only your story'});
        }
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};