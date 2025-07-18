export type Chat = {
    id: string;
    title: string;
    messages: Message[];
    isFinished: boolean;
    analysis: ChatAnalysis;
}

export type ChatAnalysis = {
    id: string;
    goodSides: string[];
    badSides: string[];
    rating: number;
    userCharacteristics: UserCharacteristics;
}

export type UserCharacteristics = {
    communicative: Partial<{
        friendly: number
        listener: number
        confident: number
        clear: number
        curious: number
    }>
    professional: Partial<{
        attentive: number
        helpful: number
        knowledge: number
        ethical: number
        market: number
    }>
    technical: Partial<{
        demand: number
        qualityPresentation: number
        confrontation: number
        persuasion: number
        initiative: number
        techniques: number
    }>
}

export interface ChatHistoryItem {
    id: string | number;
    title: string;
    createdAt?: string | Date;
  }
  

export type Message = {
    id: string;
    content: string;
    role: string;
    createdAt: string;
    hidden?: boolean;
}