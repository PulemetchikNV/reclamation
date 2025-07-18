import { ref, type ComputedRef, type Ref } from "vue";

import { computed } from "vue";

export type RequestState = {
    isLoading: boolean,
    isError: string | null,
}

export const getRequestState = (): RequestState => ({
    isLoading: false,
    isError: null,
})

export const getRequest = async <T = any>(callback: () => Promise<T>, state: RequestState, errorCallback?: () => void): Promise<T | undefined> => {
    state.isLoading = true;
    state.isError = null;

    try {
        const res = await callback();
        state.isLoading = false;
        return res;
    } catch (error) {
        state.isLoading = false;
        state.isError = error instanceof Error ? error.message : String(error);
        if (errorCallback) {
            errorCallback();
        }
        return undefined;
    }
}

export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

type DynamicKey<K extends string, T extends string> = T extends `is${infer U}` ? `is${Capitalize<K>}${U}` : `is${Capitalize<K>}${T}`;

type ObjectWithDynamicKeys<T, KeyName extends string> = T extends Object ? {
    [k in keyof T as k extends string ? DynamicKey<KeyName, k> : k]: ComputedRef<T[k]>;
} : {}

export const convertRequestStateToRefs = <K extends string>(state: RequestState, key: K)=> {
    return {
        [`is${capitalize(key)}Loading`]: computed(() => state.isLoading),
        [`is${capitalize(key)}Error`]: computed(() => state.isError),
    } as ObjectWithDynamicKeys<RequestState, K>;
}

export const transformToken = (token: string) => {
    if(!token) return ''
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

export const addQueryParams = (url: string, params: Record<string, string>) => {
    const paramsString = new URLSearchParams(params).toString();
    return `${url}?${paramsString}`;
}
