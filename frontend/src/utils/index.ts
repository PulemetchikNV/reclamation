export const getFormattedUrl = (url: string) => {
    return `${url}${url?.endsWith('/') ? '' : '/'}`;
}

export const getStaticUrl = (url: string) => {
    return `${url}${url?.endsWith('/') ? '' : '/'}static`;
}

export const getPublicUrl = (url: string) => {
    return `${url}${url?.endsWith('/') ? '' : '/'}public`;
}