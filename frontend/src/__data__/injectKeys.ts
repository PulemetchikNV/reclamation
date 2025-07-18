import type { InjectionKey } from "vue";

export const TOGGLE_SIDEBAR_KEY = Symbol('toggleSidebar') as InjectionKey<() => void>
export const API_URL_KEY = Symbol('apiUrl') as InjectionKey<string>