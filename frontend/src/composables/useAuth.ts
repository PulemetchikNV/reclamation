import { axiosInstance } from "../plugins/axios";
import { user, isAuthorized } from "../__data__/store";
import { ref } from "vue";
import { convertRequestStateToRefs, getRequest, getRequestState, transformToken } from "../utils/requests";
import { useRouter } from "vue-router";

export function useAuth() {
    const loginRequest = ref(getRequestState())
    const registerRequest = ref(getRequestState())
    const getCurrentUserRequest = ref(getRequestState())
    const router = useRouter()

    async function login(data: { email: string, password: string }) {
        return await getRequest(async () => {
            const res = await axiosInstance.post('/api/auth/login', data)
            user.value = res.data
            const accessToken = transformToken(res.data.accessToken || '')
            if(!accessToken) return

            localStorage.setItem('accessToken', accessToken)
            axiosInstance.defaults.headers.common['Authorization'] = accessToken
            axiosInstance.defaults.headers['Authorization'] = accessToken

            isAuthorized.value = true
            return res.data
        }, loginRequest.value)
    }

    async function register(data: { 
        email: string, 
        password: string,
        firstName: string,
        lastName: string,
    }) {
        return await getRequest(async () => {
            const res = await axiosInstance.post('/api/auth/register', data)
            user.value = res.data
            const accessToken = transformToken(res.data.accessToken || '')
            if(!accessToken) return

            localStorage.setItem('accessToken', accessToken)
            axiosInstance.defaults.headers.common['Authorization'] = accessToken
            axiosInstance.defaults.headers['Authorization'] = accessToken

            isAuthorized.value = true
            return res.data
        }, registerRequest.value)
    }

    async function logout() {
        console.log('logout call', router)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        user.value = null;

        isAuthorized.value = false
        router.push('/login')
    }

    async function getCurrentUser() {
        return await getRequest(async () => {
            const res = await axiosInstance.get('/api/auth/me')
            user.value = res.data
            return res.data
        }, getCurrentUserRequest.value)
    }

    return {
        login, 
        register,
        logout,
        getCurrentUser,
        ...convertRequestStateToRefs(loginRequest.value, 'login'),
        ...convertRequestStateToRefs(registerRequest.value, 'register'),
        ...convertRequestStateToRefs(getCurrentUserRequest.value, 'getCurrentUser'),
    }
}