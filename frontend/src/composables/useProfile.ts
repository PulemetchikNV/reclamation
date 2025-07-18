import { ref } from "vue";
import { axiosInstance } from "../plugins/axios";
import { addQueryParams, convertRequestStateToRefs, getRequest, getRequestState } from "../utils/requests";
import { profileCharacteristics, characteristicsHistory } from "../__data__/store";

// Тип для истории характеристик
export type CharacteristicsHistory = Record<string, Record<string, { value: number, date: Date }[]>>;

export type CharacteristicDynamic = {
    characteristicName: string;
    characteristicRus: string;
    characteristicHistory: CharacteristicsHistory[string][string];
    days?: number;
}

export function useProfile() {
    // Состояния запросов
    const getProfileCharacteristicsState = ref(getRequestState());
    const getCharacteristicsHistoryState = ref(getRequestState());
    const analyzeCharacteristicDynamicState = ref(getRequestState());
    /**
     * Получение медианных характеристик пользователя за последние 5 чатов
     */
    const getProfileCharacteristics = async () => {
        return await getRequest(async () => {
            const res = await axiosInstance.get('/api/profile/characteristics');
            profileCharacteristics.value = res.data;
            return res.data;
        }, getProfileCharacteristicsState.value);
    };

    /**
     * Получение истории изменения характеристик пользователя
     */
    const getCharacteristicsHistory = async () => {
        return await getRequest(async () => {
            const res = await axiosInstance.get('/api/profile/characteristics/history');
            
            // Преобразуем строковые даты в объекты Date
            const history = {...res.data} as CharacteristicsHistory;
            for (const category in history) {
                for (const characteristic in history[category]) {
                    history[category][characteristic] = history[category][characteristic].map(item => ({
                        value: item.value,
                        date: new Date(item.date)
                    }));
                }
            }
            
            characteristicsHistory.value = history;
            return history;
        }, getCharacteristicsHistoryState.value);
    };

    /**
     * Анализ динамики изменения характеристики
     */
    const analyzeCharacteristicDynamic = async (data: CharacteristicDynamic) => {
        return await getRequest(async () => {
            const res = await axiosInstance.post('/api/profile/characteristics/dynamic', data);
            return res.data;
        }, analyzeCharacteristicDynamicState.value);
    };

    return {
        // Методы
        getProfileCharacteristics,
        getCharacteristicsHistory,
        analyzeCharacteristicDynamic,
        
        // Состояния запросов
        ...convertRequestStateToRefs(getProfileCharacteristicsState.value, 'getProfileCharacteristics'),
        ...convertRequestStateToRefs(getCharacteristicsHistoryState.value, 'getCharacteristicsHistory'),
        ...convertRequestStateToRefs(analyzeCharacteristicDynamicState.value, 'analyzeCharacteristicDynamic'),
    };
}