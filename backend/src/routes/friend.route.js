import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    getFriendRequests,
    removeFriend,
    searchUsers
} from "../controllers/friend.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.post("/request/:receiverId", protectRoute, sendFriendRequest);
router.post("/accept/:senderId", protectRoute, acceptFriendRequest);
router.post("/reject/:senderId", protectRoute, rejectFriendRequest);
router.delete("/remove/:friendId", protectRoute, removeFriend);
router.get("/requests", protectRoute, getFriendRequests);


export default router;