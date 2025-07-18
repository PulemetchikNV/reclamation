export const APARTAMENTS_SOURCES = [
    'Telegram',
    'Instagram',
    'Facebook',
    'Avito',
    'Odnoklassniki',
]

export const getRandomApartamentSources = () => {
    const sourcesCount = Math.max(1, Math.floor(Math.random() * APARTAMENTS_SOURCES.length))
    const sources = [...APARTAMENTS_SOURCES].sort(() => Math.random() - 0.5).slice(0, sourcesCount)

    return sources.join(', ')
}

const BUYER_YEAR_RANGE = [2010, 2025]
const SELLER_YEAR_RANGE = [1955, 2025]

export const getRandomApartamentYear = (clientType: 'buyer' | 'seller') => {
    const yearRange = clientType === 'buyer' ? BUYER_YEAR_RANGE : SELLER_YEAR_RANGE
    return Math.floor(Math.random() * (yearRange[1] - yearRange[0] + 1)) + yearRange[0]
}
type RandomApartament = {
    sources: string
    year: number
}

export const getRandomApartament = (clientType: 'buyer' | 'seller'): RandomApartament => {
    const sources = getRandomApartamentSources()
    const year = getRandomApartamentYear(clientType)

    return {
        sources,
        year
    }
}