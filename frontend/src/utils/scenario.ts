import type { Scenario, ScenarioGroup } from "../types/scenario"

export const getScenarioInfo = (scenario: Scenario, scenarioGroup: ScenarioGroup) => {
    return `
      ${scenarioGroup.title}
      ${scenario.title}
    `
}

export const getClientType = (scenarioGroup: ScenarioGroup) => {
    return scenarioGroup?.title?.includes('Продав') ? 'seller' : 'buyer';
}