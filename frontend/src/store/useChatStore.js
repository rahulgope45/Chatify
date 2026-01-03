import { create } from "zustand";
import { axiosInstances } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from '../store/useAuthStore.js';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstances.get("/messages/users");
            set({ users: Array.isArray(res.data) ? res.data : [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load users");
            set({ users: [] });
            console.log("Error in getting User")
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstances.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load messages");
            console.log("Error in getting user Messages")
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessages: async (messageData) => {
        const { selectedUser, messages } = get();

        if (!selectedUser) {
            toast.error("No user selected");
            return;
        }
        
        try {
            const res = await axiosInstances.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
            get().moveUserToTop(selectedUser._id);
        } catch (error) {
            console.error("Error in sendMessages:", error);
            toast.error(error.response?.data?.error || "Failed to send message");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Clean up existing listener
        socket.off("newMessage");

        // Listen for new messages
        socket.on("newMessage", (newMessage) => {
            const { selectedUser: currentSelectedUser, messages } = get();
            
            // Only add message if it's from the currently selected user
            if (newMessage.senderId === currentSelectedUser?._id) {
                set({ messages: [...messages, newMessage] });
            }
            
            // Always move user to top when they send a message
            get().moveUserToTop(newMessage.senderId);
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
    },

    moveUserToTop: (userId) => {
        const { users } = get();
        const userIndex = users.findIndex(user => user._id === userId);

        if (userIndex > 0) {
            const updatedUsers = [...users];
            const [user] = updatedUsers.splice(userIndex, 1);
            updatedUsers.unshift(user);
            set({ users: updatedUsers });
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser })
}));