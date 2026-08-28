import Message from "../models/Message.js";

export const createMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const messageData = { name, email, message };
    if (req.user) {
      messageData.user = req.user._id;
    }

    const newMessage = await Message.create(messageData);
    res.status(201).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
};
