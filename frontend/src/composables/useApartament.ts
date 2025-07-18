import { ref } from "vue";
import { axiosInstance } from "../plugins/axios";
import type { Apartment } from "../types/apartament";
import { getRequest, getRequestState, convertRequestStateToRefs } from "../utils/requests";
import { currentApartment } from "../__data__/store";
import type { Scenario } from "../types/scenario";
export function useApartament() {
    const generateApartamentState = ref(getRequestState());
    const getApartamentState = ref(getRequestState());

    const generateApartament = async (scenarioInfo: Scenario) => {
        return await getRequest<Apartment>(async () => {
            const res = await axiosInstance.post('/api/apartments/generate', { scenarioInfo });
            currentApartment.value = res.data;
            return res.data;
        }, generateApartamentState.value);
    }

    const getApartament = async (apartamentId: string) => {
        return await getRequest<Apartment>(async () => {
            const res = await axiosInstance.get(`/api/apartments/${apartamentId}`);
            return res.data;
        }, getApartamentState.value);
    }

    return {
        generateApartament,
        getApartament,
        ...convertRequestStateToRefs(generateApartamentState.value, 'generateApartament'),
        ...convertRequestStateToRefs(getApartamentState.value, 'getApartament'),
    }
}