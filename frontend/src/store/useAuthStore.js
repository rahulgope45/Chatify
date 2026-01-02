import axios from 'axios';
import { create } from 'zustand';
import { axiosInstances } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// Fix: import.meta.env.MODE
const BASE_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigninUp: false,
    isLogginIng: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstances.get("/auth/check")  // /auth/check not auth/check
            set({ authUser: res.data })
            console.log(res.data)
            get().connectSocket()
        } catch (error) {
            console.log("Error in authCheck", error)
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigninUp: true });
        try {
            const res = await axiosInstances.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket()
        } catch (error) {
            toast.error(error.response?.data?.message);
            console.log("Signup error")
        } finally {
            set({ isSigninUp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstances.post("/auth/logout");
            get().disconnectSocket();
            set({ authUser: null });
            toast.success("Logged out successfully")
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    },

    login: async (data) => {
        set({ isLogginIng: true })
        try {
            const res = await axiosInstances.post("/auth/login", data)
            set({ authUser: res.data })
            toast.success("Login success")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            set({ isLogginIng: false })
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true })
        try {
            const res = await axiosInstances.put("/auth/update-profile", data)
            set({ authUser: res.data })
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    connectSocket: () => {
        const { authUser } = get()
        if (!authUser || get().socket?.connected) return;
        
        const newSocket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
            withCredentials: true,
            transports: ['websocket', 'polling'], 
        })
        
        newSocket.on("connect", () => {
            console.log("✅ Socket connected:", newSocket.id);
        });

        newSocket.off("getOnlineUsers");

        newSocket.on("getOnlineUsers", (userIds) => {
            console.log("📡 ONLINE USERS 👉", userIds);
            set({ onlineUsers: userIds });
        });

        newSocket.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error);
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.disconnect();
            set({ socket: null });
        }
    }
}));