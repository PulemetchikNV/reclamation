import { Prisma } from '@prisma/client';

// Типы для чата
export type ChatWithRelations = Prisma.ChatGetPayload<{
  include: {
    messages: true;
    scenario: {
      include: {
        group: true;
      };
    };
    counterparty: true;
  };
}>;

// Типы для сценария
export type ScenarioWithRelations = Prisma.ScenarioGetPayload<{
  include: {
    group: true;
    chats: true;
  };
}>;

// Типы для группы сценариев
export type ScenarioGroupWithRelations = Prisma.ScenarioGroupGetPayload<{
  include: {
    scenarios: true;
  };
}>;

// Типы для контрагента
export type CounterpartyWithRelations = Prisma.CounterpartyGetPayload<{
  include: {
    chats: true;
  };
}>;

// Типы для сообщения
export type MessageWithRelations = Prisma.MessageGetPayload<{
  include: {
    chat: true;
  };
}>;

// Типы для создания чата
export type CreateChatInput = {
  title?: string;
  scenarioId?: string;
  counterpartyId: string;
};

// Тип для метаданных уровней сложности
export type DifficultyMeta = {
  easy: string;
  medium: string;
  hard: string;
};

// Типы для создания сценария
export type CreateScenarioInput = {
  title: string;
  imageUrl?: string;
  aiPrompt: string;
  difficultyMeta?: DifficultyMeta;
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
  type: 'buyer' | 'seller';
  character: string;
  goal: string;
  description: string;
  photos: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}; 