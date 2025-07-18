<template>
    <Button
        :icon="!isRecording ? 'pi pi-microphone' : 'pi pi-ellipsis-h'"
        :loading="isTransribeLoading"
        :disabled="disabled"
        severity="info"
        @click="toggleVoiceRecording(callback)"
    />
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { useSpeech } from '../composables/useSpeech';

const { toggleVoiceRecording, isRecording, isTransribeLoading } = useSpeech();

const props = defineProps<{
    disabled?: boolean
}>()

const emit = defineEmits<{
    'transcribeFinished': [string]
}>()

const callback = (text: string) => {
    emit('transcribeFinished', text)
}
</script>