import { create } from "zustand";
import { axiosInstances } from "../lib/axios";
import toast from "react-hot-toast";

export const useChatStore = create((set) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({ isUsersLoading: true});
        try {
            const res = await axiosInstances.get("/messages/users");
            set({users: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in geting User")
        }finally{
            set({isUsersLoading: false});
        }
    },

    getMessages: async(userId) =>{
        set({isMessagesLoading:true});
        try {
            const res = await axiosInstances.get("/messages/${userId}");
            set({messages : res.data});
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in getting user Messages")
        }finally{
            set({isMessagesLoading:false})
        }
    }


}))
