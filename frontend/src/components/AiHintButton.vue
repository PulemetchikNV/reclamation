<template>
    <Button v-tooltip.top="'Получить подсказку от ИИ'" icon="pi pi-microchip-ai" severity="warning" @click="$emit('getHint')" />
</template>

<script setup lang="ts">
import { Button } from 'primevue';

defineOptions({
    name: 'AiHintButton'
})

defineEmits<{
    'getHint': []
}>()
</script>