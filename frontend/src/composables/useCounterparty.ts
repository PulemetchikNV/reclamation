import { ref, computed } from 'vue';
import { axiosInstance as api } from '../plugins/axios';
import type { Counterparty } from '../types/counterparty';
import { addMessage } from '../__data__/store';
import { currentCounterparty } from '../__data__/store';

const counterparties = ref<Counterparty[]>([]);

const isLoading = ref(false);
const error = ref<string | null>(null);

export function useCounterparty() {
    const fetchWrapper = async (request: Promise<any>) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await request;
            
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.error || err.message || 'Произошла неизвестная ошибка';
            addMessage({ severity: 'error', summary: 'Ошибка', detail: error.value, life: 5000 });
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const getCounterparties = async () => {
        counterparties.value = await fetchWrapper(api.get('/api/counterparties')) || [];
        return counterparties.value;
    };

    const getCounterparty = async (id: string) => {
        currentCounterparty.value = await fetchWrapper(api.get(`/api/counterparties/${id}`));
        
        return currentCounterparty.value;
    };

    const createCounterparty = async (formData: FormData) => {
        const data = await fetchWrapper(api.post('/api/counterparties', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }));
        if (data) {
            addMessage({ severity: 'success', summary: 'Успех', detail: 'Персонаж успешно создан!', life: 3000 });
            await getCounterparties();
            return true;
        }
        return false;
    };

    const updateCounterparty = async (id: string, formData: FormData) => {
        const data = await fetchWrapper(api.put(`/api/counterparties/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }));
        if (data) {
            addMessage({ severity: 'success', summary: 'Успех', detail: 'Персонаж успешно обновлен!', life: 3000 });
            await getCounterparties();
            return true;
        }
        return false;
    };

    const deleteCounterparty = async (id: string) => {
        const response = await fetchWrapper(api.delete(`/api/counterparties/${id}`));
        // axios.delete возвращает данные в `data`, но при 204 их нет
        if (response === null || response === '') { 
            return true;
        }
        return false;
    };


    return {
        counterparties,
        currentCounterparty,
        isCounterpartiesLoading: isLoading,
        isCounterpartiesError: error,
        getCounterparties,
        getCounterparty,
        createCounterparty,
        updateCounterparty,
        deleteCounterparty,
    };
} 