import axios from 'axios'

export const axiosInstances = axios.create({
    baseURL: import.meta.MODE === "development" ? "http://localhost:5000/api" : "/api",
    withCredentials: true
})