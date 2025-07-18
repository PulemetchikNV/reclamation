import { computed, ref } from "vue";
import { chat, chatList } from "../__data__/store";
import { axiosInstance } from "../plugins/axios";
import { convertRequestStateToRefs, getRequest, getRequestState } from "../utils/requests";

// Интерфейс для данных создания чата
interface CreateChatParams {
    title?: string;
    scenarioId?: string;
    counterpartyId?: string;
    apartmentId?: string;
}

export function useChat() {
    const getChatState = ref(getRequestState())
    const getChatsState = ref(getRequestState())
    const createChatState = ref(getRequestState())
    const sendMessageState = ref(getRequestState())
    const updateChatState = ref(getRequestState())
    const finishChatState = ref(getRequestState())
    const getHintState = ref(getRequestState())

    const getChat = async (id: string) => {
        return await getRequest(async () => {
            const res = await axiosInstance.get(`/api/chats/${id}`)
            chat.value = res.data
            return res.data
        }, getChatState.value)
    }

    const getChats = async () => {
        return await getRequest(async () => {
            const res = await axiosInstance.get('/api/chats')
            chatList.value = res.data
            return res.data
        }, getChatsState.value)
    }

    const createChat = async (params: CreateChatParams = {}) => {
        return await getRequest(async () => {
            const res = await axiosInstance.post('/api/chats', params)
            chat.value = res.data
            return res.data
        }, createChatState.value)
    }

    const updateChatTitle = async (id: string, title: string) => {
        return await getRequest(async () => {
            const res = await axiosInstance.patch(`/api/chats/${id}/title`, { title })
            if(chat.value) {
                chat.value.title = title
            }
            return res.data
        }, updateChatState.value)
    }

    const sendMessage = async (message: string) => {
        return await getRequest(async () => {
            const res = await axiosInstance.post(`/api/chats/${chat.value?.id}/message`, { content: message })
            chat.value = res.data
            return res.data
        }, sendMessageState.value)
    }

    const finishChat = async (id: string) => {
        return await getRequest(async () => {
            const res = await axiosInstance.patch(`/api/chats/${id}/finish`)
            chat.value = res.data
            return res.data 
        }, finishChatState.value)
    }

    const getHint = async (id: string) => {
        return await getRequest(async () => {
            const res = await axiosInstance.post(`/api/chats/${id}/hint`)
            return res.data
        }, getHintState.value)
    }
    
    return { 
        getChat, 
        createChat, 
        getChats,
        sendMessage,
        updateChatTitle,
        finishChat,
        getHint,
        ...convertRequestStateToRefs(getChatState.value, 'getChat'),
        ...convertRequestStateToRefs(getChatsState.value, 'getChats'),
        ...convertRequestStateToRefs(createChatState.value, 'createChat'),
        ...convertRequestStateToRefs(sendMessageState.value, 'sendMessage'),
        ...convertRequestStateToRefs(updateChatState.value, 'updateChatTitle'),
        ...convertRequestStateToRefs(finishChatState.value, 'finishChat'),
        ...convertRequestStateToRefs(getHintState.value, 'getHint'),
    }
}