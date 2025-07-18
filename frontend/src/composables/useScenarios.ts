import { computed, ref } from "vue";
import { axiosInstance } from "../plugins/axios";
import { convertRequestStateToRefs, getRequest, getRequestState } from "../utils/requests";
import { scenarioGroups, currentGroup, scenarios, currentScenario } from "../__data__/store";
import type { ScenarioGroup, Scenario } from "../types/scenario";

export function useScenarios() {
    // Состояния запросов
    const getScenarioGroupsState = ref(getRequestState());
    const getGroupScenariosState = ref(getRequestState());
    const getScenarioState = ref(getRequestState());

    /**
     * Получение всех групп сценариев
     */
    const getScenarioGroups = async () => {
        return await getRequest<ScenarioGroup[]>(async () => {
            const res = await axiosInstance.get('/api/scenario-groups');
            scenarioGroups.value = res.data;
            return res.data;
        }, getScenarioGroupsState.value);
    };

    /**
     * Получение сценариев для конкретной группы
     */
    const getGroupScenarios = async (groupId: string) => {
        return await getRequest<ScenarioGroup>(async () => {
            const res = await axiosInstance.get(`/api/scenario-groups/${groupId}`);
            currentGroup.value = res.data;
            scenarios.value = res.data.scenarios || [];
            return res.data;
        }, getGroupScenariosState.value);
    };

    /**
     * Получение конкретного сценария по ID
     */
    const getScenario = async (scenarioId: string) => {
        return await getRequest<Scenario>(async () => {
            const res = await axiosInstance.get(`/api/scenarios/${scenarioId}`);
            currentScenario.value = res.data;
            return res.data;
        }, getScenarioState.value);
    };

    return {
        // Данные
        scenarioGroups,
        currentGroup,
        scenarios,
        currentScenario,
        
        // Методы
        getScenarioGroups,
        getGroupScenarios,
        getScenario,
        
        ...convertRequestStateToRefs(getScenarioGroupsState.value, 'groups'),
        ...convertRequestStateToRefs(getGroupScenariosState.value, 'groupScenarios'),
        ...convertRequestStateToRefs(getScenarioState.value, 'scenario'),
    };
}
