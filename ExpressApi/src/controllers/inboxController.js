import Message from "../model/message";

// create message
export const createMessage = async (req, res) => {
  const { receiverId, text } = req.body;

  if (!receiverId || !text) {
    return res
      .status(400)
      .json({
        message: "Conversation Id, receiverId and message text are require",
      });
  }

  const newMessage = new Message({
    senderId: req.user.id,
    receiverId,
    text,
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { receiverId } = req.params;
  const senderId = req.user.id;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
    .populate("senderId", "username profilePicture")
    .populate("receiverId", "username profilePicture")
    .sort({ createAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
