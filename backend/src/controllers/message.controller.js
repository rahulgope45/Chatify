import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async(req, res) =>{

    try {
        const loogedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loogedInUserId}}.select("-password"));

        res.status(200).json(filteredUsers);
        
    } catch (error) {
        
    }
}

export const getMessages = async(req, res) =>{
    try {
        const {id: userToChatid} =req.params
        const myId = req.user._id;

        const messages = await MessageChannel.find({
            $or:[
                {senderId: myId , receiverId: userToChatid},
                {senderId: userToChatid, receiverId: myId},
            ]
        })
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller", error.messages);
        res.status(500).json({error: "Internal server error"});
    }
}

export const sendMessage= async(req, res) =>{
        try {
            const {text, image} = req.body;
            const {id: receiverId} =req.params;
            const senderId = req.user._id;
            let imageUrl;
            if(image){
                //Upload base64 image to cloudinary
                const uploadResponce = await cloudinary.uploader.upload(image)
                imageUrl = uploadResponce.secure_url;
            }


            const newMessage = new MessageChannel({
                senderId,
                receiverId,
                text,
                image : imageUrl,
        })
        res.status(201).json(newMessage);

        await newMessage.save();
        } catch (error) {
            console.log("Error in sendMessages controller", error.messages);
            
            res.status(500).json({error: "Internal server error"});
            
        }
}