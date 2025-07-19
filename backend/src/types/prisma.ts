import { Prisma, Scenario, ScenarioGroup, Counterparty, Chat, Message } from '../generated/prisma/index.js';

// Типы для чата
export type ChatWithRelations = Chat & {
  messages: Message[];
  scenario: ScenarioWithRelations | null;
  counterparty: Counterparty;
  };

// Типы для сценария
export type ScenarioWithRelations = Scenario & {
  group: ScenarioGroup;
  chats: Chat[];
  };

// Типы для группы сценариев
export type ScenarioGroupWithRelations = ScenarioGroup & {
  scenarios: Scenario[];
  };

// Типы для контрагента
export type CounterpartyWithRelations = Counterparty & {
  chats: Chat[];
  };

// Типы для сообщения
export type MessageWithRelations = Message & {
  chat: Chat;
  };

// Типы для создания чата
export type CreateChatInput = {
  title?: string;
  scenarioId?: string;
  counterpartyId: string;
};

// Типы для создания сценария
export type CreateScenarioInput = {
  title: string;
  imageUrl?: string;
  aiPrompt: string;
  scenarioMeta?: Prisma.JsonValue;
  groupId: string;
};

// Типы для создания группы сценариев
export type CreateScenarioGroupInput = {
  title: string;
  description?: string;
};

// Типы для создания контрагента
export type CreateCounterpartyInput = {
  name: string;
  character: string;
  goal: string;
  description: string;
  photos: string[];
  characterData?: Prisma.JsonValue;
}; 