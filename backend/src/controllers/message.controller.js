import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async(req, res) =>{

    try {
        const loogedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loogedInUserId}})
        .select("-password")
        .sort({lastMessageTime: -1}); //selecting and sorting

        res.status(200).json(filteredUsers);
        
    } catch (error) {
        
    }
}

export const getMessages = async(req, res) =>{
    try {
        const {id: userToChatid} =req.params
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId: myId , receiverId: userToChatid},
                {senderId: userToChatid, receiverId: myId},
            ]
        })
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate that at least text or image is provided
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

    const now = new Date();
    await User.findByIdAndUpdate(senderId , {lastMessageTime: now});
    await User.findByIdAndUpdate(receiverId, {lastMessageTime: now});

  //realtime Fuctionality 
  const receiverSocketId = getReceiverSocketId(receiverId);
  if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

    res.status(201).json(newMessage);

  } catch (error) {
    console.error("SEND MESSAGE ERROR ", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

