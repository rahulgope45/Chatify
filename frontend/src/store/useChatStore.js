import { create } from "zustand";
import { axiosInstances } from "../lib/axios";
import toast from "react-hot-toast";


export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async (userId) => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstances.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in geting User")
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
            toast.error(error.response.data.message);
            console.log("Error in getting user Messages")
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

    sendMessages: async (messageData) => {
        const {selectedUser} = get();

        if (!selectedUser) {
            toast.error("No user selected");
            return;
        }
        try {
            const res = await axiosInstances.post(`/messages/send/${selectedUser._id}`, messageData);
            set((state) => ({
                messages: [...state.messages, res.data],
            }))
        } catch (error) {
            toast.error("Error in sendMessages")
        }
    }


}))
