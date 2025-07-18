// Типы контрагентов
export type CounterpartyType = 'buyer' | 'seller';

// Уровни сложности
export type Difficulty = 'easy' | 'medium' | 'hard';

// Интерфейс контрагента
export interface Counterparty {
  id: string;
  name: string;
  type: CounterpartyType;
  character: string;     // Характер контрагента
  goal: string;          // Цель контрагента
  description: string;   // Описание контрагента
  photos: string[];      // Массив URL фотографий
  difficulty: Difficulty; 
  createdAt: string;
  updatedAt: string;
}

// Интерфейс для создания контрагента
export interface CreateCounterpartyData {
  name: string;
  type: CounterpartyType;
  character: string;
  goal: string;
  description: string;
  photos?: string[];
  difficulty?: Difficulty;
}

// Интерфейс для генерации контрагента
export interface GenerateCounterpartyParams {
  type?: CounterpartyType;
} 