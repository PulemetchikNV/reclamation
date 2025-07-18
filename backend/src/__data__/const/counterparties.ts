export const NAMES = [
    'Александр',
    'Алексей',
    'Андрей',
    'Антон',
    'Артем',
    'Борис',
    'Владимир',
    'Владислав',
    'Геннадий',
    'Денис',
    'Евгений',
    'Иван',
]

export const FEMALE_NAMES = [
    'Александра',
    'Алена',
    'Алиса',
    'Алла',
    'Алла',
    'Анна',
    'Антонина',
    'Валентина',
    'Вера',
    'Вероника',
    'Виктория',
    'Галина',
    'Дарья',
]

export const LAST_NAMES = [
    'Иванов',
    'Петров',
    'Сидоров',
    'Кузнецов',
    'Смирнов',
    'Попов',
    'Васильев',
    'Михайлов',
    'Федоров',
    'Морозов',
    'Волков',
    'Кузьмин',
    'Симоньян',
    'Орлов',
    'Соколов',
    'Яковлев',
    'Поляков',
    'Степанов',
    'Клопов'
]

export const FEMALE_LAST_NAMES = [
    'Иванова',
    'Петрова',
    'Сидорова',
    'Кузнецова',
    'Смирнова',
    'Попова',
    'Васильева',
    'Михайлова',
    'Федорова',
    'Морозова',
    'Волкова',
    'Кузьмина',
]

export const BUYER_ROLES = [
    'Айтишник',
    'Стартапер',
    'Семьянин',
    'Бизнесмен',
    'Предприниматель',
    'Депутат',
    'Студент',
    'Сотрудник банка',
    'Сотрудник страховой компании',
    'Сотрудник пенсионного фонда',
    'Военнослужащий',
    'Сотрудник полиции',
    'Сотрудник МВД',
    'Сотрудник ФСБ',
    'Сотрудник ФСИН',
    'Сотрудник ГИБДД',
    'Сотрудник МЧС',
    
]

export const SELLER_ROLES = [
    'Стартапер',
    'Семьянин',
    'Бизнесмен',
    'Пенсионер',
    'Служащий',
    'Врач',
    'Менеджер',
    'Айтишник',
    'Работник склада',
    'Работник магазина',
    'Работник офиса',
    'Доставщик пиццы'
]

export const CHARACTER_SHORT = [
    'Спокойный',
    'Хамоватый',
    'Вредный',
    'Привередливый',
    'Скупой',
    'Грубый',
    'Юморной',
    'Несерьезный',
    'Суровый',
    'Подвыпивший',
    'Злой',
    'Нудный',
    'Надоедливый'
]

export function getRandomName(gender: 'male' | 'female') {
    if (gender === 'male') {
        return NAMES[Math.floor(Math.random() * NAMES.length)]
    } else {
        return FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]
    }
}

export function getRandomLastName(gender: 'male' | 'female') {
    if (gender === 'male') {
        return LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
    } else {
        return FEMALE_LAST_NAMES[Math.floor(Math.random() * FEMALE_LAST_NAMES.length)]
    }
}

export function getRandomGender(): 'male' | 'female' {
    return Math.random() < 0.5 ? 'male' : 'female'
}

export function getGoal(type: 'buyer' | 'seller'): string {
    if (type === 'buyer') {
        return 'Купить квартиру за минимальную цену'
    } else {
        return 'Продать квартиру за максимальную цену'
    }
}

type RandomCounterparty = {
    name: string
    lastName: string
    gender: 'male' | 'female'
    type: 'buyer' | 'seller'
    goal: string
    age: number
    role: string
    characterShort: string
}

export function getRandomCounterparty(type: 'buyer' | 'seller'): RandomCounterparty {
    const gender = getRandomGender()
    const name = getRandomName(gender)
    const lastName = getRandomLastName(gender)
    const role = type === 'buyer' ? 
        BUYER_ROLES[Math.floor(Math.random() * BUYER_ROLES.length)] :
        SELLER_ROLES[Math.floor(Math.random() * SELLER_ROLES.length)]
        
    const MIN_AGE = 20
    const MAX_AGE = 80
    const age = Math.min(MAX_AGE, Math.max(MIN_AGE, Math.floor(Math.random() * (MAX_AGE - MIN_AGE + 1))))
    const characterShort = CHARACTER_SHORT[Math.floor(Math.random() * CHARACTER_SHORT.length)]

    return { 
        name, 
        lastName, 
        gender, 
        type, 
        goal: getGoal(type),
        age,
        role,
        characterShort
    }
}
