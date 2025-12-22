import axios from 'axios';
import {create } from 'zustand';
import { axiosInstances } from '../lib/axios.js';
import toast from 'react-hot-toast';
export const useAuthStore = create((set) => ({
    authUser: null,
    
    isSigninUp: false,
    isLogginIng: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async() => {
        try {
            const res = await axiosInstances.get("auth/check")
            set({authUser:res.data})
            console.log(res.data)
        } catch (error) {
            console.log("Error in authCheck")
            set({authUser:null})
            
        }
        finally{
            set({isCheckingAuth:false});

        }
    },

    signup: async (data) =>{
         set({isSigninUp: true});
         try {
            const res = await axiosInstances.post("/auth/signup",data);
            set({authUser: res.data});
            toast.success("Account created successfully");
            console.log("Signup success")
         } catch (error) {
            toast.error(error.response.data.message);
            console.log("Signup error")
         }finally{
            set({isSigninUp: false});
         }
    },

    logout: async () => {
        try {
            await axiosInstances.post("/auth/logout");
            set({authUser: null});
            toast.success("Logeed out successfully")
            console.log("logout success")
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("logout error")
        }
    },

    login: async (data) => {
        set({isLogginIng : true})
        try {
            const res = await axiosInstances.post("/auth/login", data)
            set({authUser :res.data})
            console.log("Login success",res.data)
            toast.success("Login success")
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("login error")
        }finally{
            set({isLogginIng: false})
        }
    }
    
    
    
})) 