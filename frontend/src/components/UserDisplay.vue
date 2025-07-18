<template>
    <div class="user-display">
        <Avatar :image="user?.avatarUrl" :label="user?.firstName?.[0]" size="large" shape="circle" />
        <span>{{ user?.firstName }} {{ user?.lastName }}</span>
    </div>
</template>

<script setup lang="ts">
import { user } from '../__data__/store';
import { Avatar } from 'primevue';
</script>

<style scoped>
.user-display {
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(-10px);
    gap: 1rem;
    cursor: pointer;
    transition: filter 0.3s ease;
}

.user-display:hover {
    filter: brightness(0.8);
}
</style>