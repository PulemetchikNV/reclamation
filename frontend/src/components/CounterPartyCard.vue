<script setup lang="ts">
import { API_URL_KEY } from '../__data__/injectKeys';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import { inject, watch } from 'vue';
import type { Counterparty } from '../types/counterparty';
import Tag from 'primevue/tag';
import { getStaticUrl } from '../utils';
defineOptions({
    name: 'CounterPartyCard'
});

const props = defineProps<{
    counterparty: Counterparty
    canChangeDifficulty: boolean
}>();

defineEmits<{
    'toggleDifficulty': [string]
}>();


// Функция для определения цвета метки типа контрагента
const getTypeTagColor = (type: string) => {
    return type === 'buyer' ? 'info' : 'success';
};

// Функция для определения цвета метки сложности
const getDifficultyTagColor = (difficulty: string) => {
    switch (difficulty) {
        case 'easy': return 'success';
        case 'medium': return 'warning';
        case 'hard': return 'danger';
        default: return 'info';
    }
};

const getDifficultyTagValue = (difficulty: string) => {
        return (difficulty === 'easy' ? 'Легкий' : difficulty === 'medium' ? 'Средний' : 'Сложный') + ' уровень';
};

const apiUrl = inject(API_URL_KEY)?.replace(/\/$/, '');
</script>
<template>
    <Card class="counterparty-card" :pt="{body: {style: {paddingTop: '0'}}}">
        <template #header v-if="counterparty.photos && counterparty.photos.length">
            <div class="counterparty-header">
                <div class="header">
                    <div class="image-container">
                    <Avatar 
                        :image="`${apiUrl}${counterparty.photos[0]}`" 
                        alt="Фото контрагента" 
                        imageClass="main-photo"
                        size="xlarge"
                        shape="square"
                    />
                    </div>
                    <div class="title-container">
                        <h2 class="name">{{ counterparty.name }}</h2>
                    </div>
                    <div class="spacer" />
                    <slot name="icons" />
                </div>
                <div class="tags-container">
                    <Tag 
                        :value="counterparty.type === 'buyer' ? 'Покупатель' : 'Продавец'" 
                        :severity="getTypeTagColor(counterparty.type)"
                    />
                    <Tag 
                        :value="getDifficultyTagValue(counterparty.difficulty)" 
                        :severity="getDifficultyTagColor(counterparty.difficulty)"
                        :class="canChangeDifficulty ? 'difficulty-tag' : ''"
                        @click="canChangeDifficulty ? $emit('toggleDifficulty', counterparty.difficulty) : null"
                    />
                </div>
            </div>
        </template>
        
        <template #content>
            <p class="caption">{{ counterparty.description }}</p>
        </template>
    </Card>
</template>

<style scoped>
.counterparty-card {
    width: 100%;
}

.counterparty-header {
    gap: 1rem;
    padding-inline: 1rem;
    padding-top: 1rem;
    margin-bottom: 1rem;
}

.caption {
    margin: 0;
    font-size: 1rem;
    text-align: start;
}

.difficulty-tag {
    cursor: pointer;
    transition: filter 0.3s ease;
}

.difficulty-tag:hover {
    filter: brightness(0.8);
}

.tags-container {
    display: flex;
    gap: 0.5rem;
    text-align: start;
}
</style>