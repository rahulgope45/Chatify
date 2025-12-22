import axios from 'axios';
import {create } from 'zustand';
import { axiosInstances } from '../lib/axios.js';
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

    signuo: async (data) =>{
        
    } 
    
})) 