/**
 * Интерфейс для модели сценария
 */
export interface Scenario {
  id: string;
  title: string;
  imageUrl?: string;
  aiPrompt: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
  group?: ScenarioGroup;
  chats?: any[];
}

/**
 * Интерфейс для модели группы сценариев
 */
export interface ScenarioGroup {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  scenarios?: Scenario[];
}

/**
 * Интерфейс для краткой информации о сценарии
 */
export interface ScenarioListItem {
  id: string;
  title: string;
  imageUrl?: string;
  groupId: string;
}

/**
 * Интерфейс для краткой информации о группе сценариев
 */
export interface ScenarioGroupListItem {
  id: string;
  title: string;
  description?: string;
} 