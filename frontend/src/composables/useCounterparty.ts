import { ref } from 'vue';
import type { Counterparty } from '../types/counterparty';
import { axiosInstance as api } from '../plugins/axios';
import { convertRequestStateToRefs, getRequestState } from '../utils/requests';
import { getRequest } from '../utils/requests';
import { currentCounterparty } from '../__data__/store';

export function useCounterparty() {
  const counterparties = ref<Counterparty[]>([]);
  const isCounterpartiesLoading = ref(false);
  const isCounterpartiesError = ref<string | null>(null);


  const getCounterpartyState = ref(getRequestState())

  const isCreating = ref(false);
  const createError = ref<string | null>(null);

  const getCounterparties = async () => {
    isCounterpartiesLoading.value = true;
    isCounterpartiesError.value = null;
    try {
      const response = await api.get<Counterparty[]>('/api/counterparties');
      counterparties.value = response.data;
    } catch (err) {
      isCounterpartiesError.value = 'Не удалось загрузить персонажей';
    } finally {
      isCounterpartiesLoading.value = false;
    }
  };

  const getCounterparty = async (id: string) => {
    return await getRequest<Counterparty>(async () => {
      const response = await api.get<Counterparty>(`/api/counterparties/${id}`);
      currentCounterparty.value = response.data
      return response.data;
    }, getCounterpartyState.value)
  };

  const createCounterparty = async (data: any): Promise<boolean> => {
    isCreating.value = true;
    createError.value = null;
    try {
      await api.post('/api/counterparties', data);
      await getCounterparties(); // Refresh the list
      return true;
    } catch (err) {
      createError.value = 'Не удалось создать персонажа';
      return false;
    } finally {
      isCreating.value = false;
    }
  };

  return {
    counterparties,
    isCounterpartiesLoading,
    isCounterpartiesError,
    getCounterparties,
    isCreating,
    createError,
    createCounterparty,
    getCounterparty,
    ...convertRequestStateToRefs(getCounterpartyState.value, 'counterparty'),
  };
} 