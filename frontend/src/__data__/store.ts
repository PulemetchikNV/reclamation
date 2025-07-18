import { ref } from "vue";
import type { Chat, ChatHistoryItem, UserCharacteristics } from "../types/chat";
import type { ScenarioGroup, Scenario } from "../types/scenario";
import type { Counterparty } from "../types/counterparty";
import type { User } from "../types/auth";
import type { CharacteristicsHistory } from "../composables/useProfile";
import type { Apartment } from "../types/apartament";

// Интерфейс для сообщения уведомления
export interface NotificationMessage {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  life?: number;
}

// Хранилище для уведомлений
export const pendingMessages = ref<NotificationMessage[]>([]);

export const addMessage = (message: NotificationMessage) => {
  if(!message.life) message.life = 2500;
  pendingMessages.value.push(message);
};

export const consumeMessages = (): NotificationMessage[] => {
  const messages = pendingMessages.value;
  pendingMessages.value = [];
  return messages;
};


export const user = ref<User | null>(null);
export const isAuthorized = ref(localStorage.getItem('accessToken') !== null);

// Хранилище для чатов
export const chat = ref<Chat | null>(null);
export const chatList = ref<ChatHistoryItem[]>([]);

// Хранилище для сценариев
export const scenarioGroups = ref<ScenarioGroup[]>([]);
export const currentGroup = ref<ScenarioGroup | null>(null);
export const scenarios = ref<Scenario[]>([]);
export const currentScenario = ref<Scenario | null>(null);

// Хранилище для контрагентов
export const counterparties = ref<Counterparty[]>([]);
export const currentCounterparty = ref<Counterparty | null>(null);

export const currentApartment = ref<Apartment | null>(null);

// Хранилище для профиля
export const profileCharacteristics = ref<UserCharacteristics | null>(null);
export const characteristicsHistory = ref<CharacteristicsHistory | null>(null);

export const isSidebarOpen = ref(false);