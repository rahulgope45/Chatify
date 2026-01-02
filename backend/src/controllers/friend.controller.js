import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.params;

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ message: "Cannot send request to yourself" });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already friends
        if (receiver.friends.includes(senderId)) {
            return res.status(400).json({ message: "Already friends" });
        }

        // Check if request already sent
        if (receiver.friendsRequests.received.includes(senderId)) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Add to received requests
        receiver.friendsRequests.received.push(senderId);
        await receiver.save();

        // Add to sent requests
        await User.findByIdAndUpdate(senderId, {
            $push: { "friendsRequests.sent": receiverId },
        });

        // Send real-time notification
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("friendRequest", {
                senderId,
                senderName: req.user.fullName,
                senderProfilePic: req.user.profilePic
            });
        }

        res.status(200).json({ message: "Friend request sent" });
    } catch (error) {
        console.error("Error in sendFriendRequest:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { senderId } = req.params;

        // Update both users
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { "friendsRequests.received": senderId },
            $push: { friends: senderId },
        });

        await User.findByIdAndUpdate(senderId, {
            $pull: { "friendsRequests.sent": currentUserId },
            $push: { friends: currentUserId },
        });

        // Send real-time notification
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("friendRequestAccepted", {
                userId: currentUserId,
                userName: req.user.fullName,
                userProfilePic: req.user.profilePic
            });
        }

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error in acceptFriendRequest:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const rejectFriendRequest = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { senderId } = req.params;

        await User.findByIdAndUpdate(currentUserId, {
            $pull: { "friendsRequests.received": senderId },
        });

        await User.findByIdAndUpdate(senderId, {
            $pull: { "friendsRequests.sent": currentUserId },
        });

        res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        console.error("Error in rejectFriendRequest:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId)
            .populate('friendsRequests.received', 'fullName email profilePic')
            .populate('friendsRequests.sent', 'fullName email profilePic');

        res.status(200).json({
            received: user.friendsRequests.received,
            sent: user.friendsRequests.sent
        });
    } catch (error) {
        console.error("Error in getFriendRequests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeFriend = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { friendId } = req.params;

        await User.findByIdAndUpdate(currentUserId, {
            $pull: { friends: friendId },
        });

        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: currentUserId },
        });

        res.status(200).json({ message: "Friend removed" });
    } catch (error) {
        console.error("Error in removeFriend:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user._id;

        if (!query || query.trim() === '') {
            return res.status(400).json({ message: "Search query required" });
        }

        const currentUser = await User.findById(currentUserId).select('friends friendsRequests');

        // Search users by name or email, exclude current user, friends, and pending requests
        const users = await User.find({
            $and: [
                {
                    $or: [
                        { fullName: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                },
                { _id: { $ne: currentUserId } }, // Not the current user
                { _id: { $nin: currentUser.friends } }, // Not already friends
                { _id: { $nin: currentUser.friendsRequests.sent } }, // Not already sent request
                { _id: { $nin: currentUser.friendsRequests.received } } // Not received request from them
            ]
        })
        .select('fullName email profilePic')
        .limit(10);

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in searchUsers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};