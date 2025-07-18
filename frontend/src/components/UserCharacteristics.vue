<script setup lang="ts">
import type { UserCharacteristics } from '../types/chat';
import UserCharacteristicsChart from './UserCharacteristicsChart.vue';

defineProps<{
    userCharacteristics: UserCharacteristics
}>()
</script>

<template>
    <div class="user-characteristics">
        <h4 class="title">
            <slot name="title">
                Характеристика
            </slot>
        </h4>
        <UserCharacteristicsChart :userCharacteristics="userCharacteristics" />
    </div>
</template>

<style scoped>
.user-characteristics {
    padding: 1rem;
}

.title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
}
</style>