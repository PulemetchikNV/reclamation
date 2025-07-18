import axios from "axios";
import router from "../router";
import { transformToken } from "../utils/requests";
import { addMessage } from "../__data__/store";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Authorization': transformToken(localStorage.getItem('accessToken') || '')
    }
})

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/login')
        }
        if(error.response.data.message) {
            addMessage({
                detail: error.response.data.message,
                severity: 'error'
            })
        }
        return Promise.reject(error);
    }
)

