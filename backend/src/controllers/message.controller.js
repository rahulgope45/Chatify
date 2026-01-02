import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Only show users who are friends
export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        
        // Get the logged-in user with their friends list
        const currentUser = await User.findById(loggedInUserId).select('friends');
        
        // Find only users who are in the friends array
        const filteredUsers = await User.find({ 
            _id: { $in: currentUser.friends } // Only friends
        })
        .select("-password")
        .sort({ lastMessageTime: -1 });

        res.status(200).json(filteredUsers);
        
    } catch (error) {
        console.log("Error in getUsersForSidebar:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMessages = async(req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        // Verify that the user is a friend before showing messages
        const currentUser = await User.findById(myId).select('friends');
        if (!currentUser.friends.includes(userToChatId)) {
            return res.status(403).json({ error: "You can only message friends" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ]
        });
        
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Verify that the receiver is a friend
        const currentUser = await User.findById(senderId).select('friends');
        if (!currentUser.friends.includes(receiverId)) {
            return res.status(403).json({ error: "You can only message friends" });
        }

        if (!text && !image) {
            return res.status(400).json({ error: "Message must contain text or image" });
        }

        let imageUrl;
        if (image && image.startsWith("data:image")) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat_images",
            });
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Update lastMessageTime for both users
        const now = new Date();
        await User.findByIdAndUpdate(senderId, { lastMessageTime: now });
        await User.findByIdAndUpdate(receiverId, { lastMessageTime: now });

        // Realtime functionality
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.error("SEND MESSAGE ERROR", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};