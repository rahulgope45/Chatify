import { create } from "zustand";
import { axiosInstances } from "../lib/axios";
import toast from "react-hot-toast";

export const useFriendStore = create((set, get) => ({
    receivedRequests: [],
    sentRequests: [],
    searchResults: [],
    isLoading: false,
    isSearching: false,

    getFriendRequests: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstances.get("/friends/requests");
            set({ 
                receivedRequests: res.data.received,
                sentRequests: res.data.sent
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load requests");
        } finally {
            set({ isLoading: false });
        }
    },

    searchUsers: async (query) => {
        if (!query || query.trim() === '') {
            set({ searchResults: [] });
            return;
        }

        set({ isSearching: true });
        try {
            const res = await axiosInstances.get(`/friends/search?query=${encodeURIComponent(query)}`);
            set({ searchResults: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to search users");
            set({ searchResults: [] });
        } finally {
            set({ isSearching: false });
        }
    },

    sendFriendRequest: async (receiverId) => {
        try {
            await axiosInstances.post(`/friends/request/${receiverId}`);
            
            // Remove from search results after sending request
            set((state) => ({
                searchResults: state.searchResults.filter(user => user._id !== receiverId)
            }));
            
            toast.success("Friend request sent");
            
            // Refresh friend requests to update sent list
            get().getFriendRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send request");
        }
    },

    acceptRequest: async (senderId) => {
        try {
            await axiosInstances.post(`/friends/accept/${senderId}`);
            set((state) => ({
                receivedRequests: state.receivedRequests.filter(req => req._id !== senderId)
            }));
            toast.success("Friend request accepted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to accept request");
        }
    },

    rejectRequest: async (senderId) => {
        try {
            await axiosInstances.post(`/friends/reject/${senderId}`);
            set((state) => ({
                receivedRequests: state.receivedRequests.filter(req => req._id !== senderId)
            }));
            toast.success("Friend request rejected");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject request");
        }
    },

    clearSearchResults: () => set({ searchResults: [] }),
}));