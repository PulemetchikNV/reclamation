<script setup lang="ts">
import { API_URL_KEY } from '../__data__/injectKeys';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import { inject, watch } from 'vue';
import type { Counterparty } from '../types/counterparty';

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


const apiUrl = inject(API_URL_KEY)?.replace(/\/$/, '');
</script>
<template>
    <Card class="counterparty-card" :pt="{body: {style: {paddingTop: '0'}}}">
        <template #header>
            <div class="counterparty-header">
                <div class="header">
                    <div class="image-container">
                    <Avatar
                        :image="counterparty.photos?.length > 0 ? `${apiUrl}${counterparty.photos[0]}` : ''" 
                        :label="counterparty.photos?.length === 0 ? counterparty.name[0] : ''"
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