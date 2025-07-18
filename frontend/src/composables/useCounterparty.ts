import { computed, ref } from "vue";
import { axiosInstance } from "../plugins/axios";
import { convertRequestStateToRefs, getRequest, getRequestState } from "../utils/requests";
import { counterparties, currentCounterparty } from "../__data__/store";
import type { Counterparty, CreateCounterpartyData, GenerateCounterpartyParams } from "../types/counterparty";

export function useCounterparty() {
    // Состояния запросов
    const getCounterpartiesState = ref(getRequestState());
    const getCounterpartyState = ref(getRequestState());
    const createCounterpartyState = ref(getRequestState());
    const updateCounterpartyState = ref(getRequestState());
    const deleteCounterpartyState = ref(getRequestState());
    const generateCounterpartyState = ref(getRequestState());

    /**
     * Получение всех контрагентов
     */
    const getCounterparties = async () => {
        return await getRequest<Counterparty[]>(async () => {
            const res = await axiosInstance.get('/api/counterparties');
            counterparties.value = res.data;
            return res.data;
        }, getCounterpartiesState.value);
    };

    /**
     * Получение контрагента по ID
     */
    const getCounterparty = async (id: string) => {
        return await getRequest<Counterparty>(async () => {
            const res = await axiosInstance.get(`/api/counterparties/${id}`);
            currentCounterparty.value = res.data;
            return res.data;
        }, getCounterpartyState.value);
    };

    /**
     * Создание нового контрагента
     */
    const createCounterparty = async (data: CreateCounterpartyData) => {
        return await getRequest<Counterparty>(async () => {
            const res = await axiosInstance.post('/api/counterparties', data);
            return res.data;
        }, createCounterpartyState.value);
    };

    /**
     * Обновление контрагента
     */
    const updateCounterparty = async (id: string, data: Partial<CreateCounterpartyData>) => {
        return await getRequest<Counterparty>(async () => {
            const res = await axiosInstance.patch(`/api/counterparties/${id}`, data);
            
            // Обновляем текущего контрагента, если он был загружен
            if (currentCounterparty.value && currentCounterparty.value.id === id) {
                currentCounterparty.value = res.data;
            }
            
            return res.data;
        }, updateCounterpartyState.value);
    };

    /**
     * Удаление контрагента
     */
    const deleteCounterparty = async (id: string) => {
        return await getRequest<void>(async () => {
            await axiosInstance.delete(`/api/counterparties/${id}`);
            
            // Сбрасываем текущего контрагента, если он был удален
            if (currentCounterparty.value && currentCounterparty.value.id === id) {
                currentCounterparty.value = null;
            }
            
            // Удаляем контрагента из списка, если список загружен
            if (counterparties.value.length > 0) {
                counterparties.value = counterparties.value.filter(c => c.id !== id);
            }
        }, deleteCounterpartyState.value);
    };

    /**
     * Генерация нового контрагента с помощью AI
     */
    const generateCounterparty = async (params: GenerateCounterpartyParams = {}) => {
        return await getRequest<Counterparty>(async () => {
            const res = await axiosInstance.post('/api/counterparties/generate', params);
            
            // Получаем созданного контрагента и добавляем его в список (если список загружен)
            if (counterparties.value.length > 0) {
                counterparties.value = [...counterparties.value, res.data];
            }
            
            return res.data;
        }, generateCounterpartyState.value);
    };

    return {
        // Данные
        counterparties,
        
        // Методы
        getCounterparties,
        getCounterparty,
        createCounterparty,
        updateCounterparty,
        deleteCounterparty,
        generateCounterparty,
        
        ...convertRequestStateToRefs(getCounterpartiesState.value, 'counterparties'),
        ...convertRequestStateToRefs(getCounterpartyState.value, 'counterparty'),
        ...convertRequestStateToRefs(createCounterpartyState.value, 'createCounterparty'),
        ...convertRequestStateToRefs(updateCounterpartyState.value, 'updateCounterparty'),
        ...convertRequestStateToRefs(deleteCounterpartyState.value, 'deleteCounterparty'),
        ...convertRequestStateToRefs(generateCounterpartyState.value, 'generateCounterparty'),
    };
} 