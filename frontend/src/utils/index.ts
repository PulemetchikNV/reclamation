export const getStaticUrl = (url: string) => {
    return `${url}${url?.endsWith('/') ? '' : '/'}static`;
}