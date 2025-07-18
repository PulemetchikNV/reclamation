<template>
  <div 
    class="messages-container"
    :style="{ maxHeight: maxHeight ? `${maxHeight}px` : 'auto' }"
  >
    <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="message.role"
    >
      <div class="message-header">
        <span class="role">{{ message.role === 'user' ? 'Вы' : 'AI' }}
          <template v-if="message.hidden">--hidden--</template>
        </span>

        <div class="spacer" />
        <Button 
          v-if="message.role === 'model' && message.audioUrl" 
          :disabled="isSpeaking"
          :icon="isSpeaking && currentSpeakingId === message.id ? 'pi pi-volume-up' : 'pi pi-volume-off'"
          size="small"
          style="margin-right: 5px"
          class="speech-button"
          rounded
          text
          @click="speakMessage(message.content)"
        />
        <span class="created-at">{{ formatDate(message.createdAt) }}</span>
        
      </div>
      <div class="message-content">
        {{ message.content || '-' }}
      </div>
    </div>
    <div v-if="messages.length === 0" class="no-messages">
      Нет сообщений
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSpeech } from '../../composables/useSpeech';
import { addMessage } from '../../__data__/store';
import Button from 'primevue/button';

interface Message {
  id: string | number;
  role: string;
  content: string;
  createdAt: string | Date;
  hidden?: boolean;
  audioUrl?: string;
}

const props = defineProps<{
  messages: Message[];
  maxHeight?: number;
}>();

const { synthesizeSpeech } = useSpeech();
const isSpeaking = ref(false);
const currentSpeakingId = ref<string | number | null>(null);
const currentAudio = ref<HTMLAudioElement | null>(null);

async function speakMessage(text: string) {
  if (isSpeaking.value) {
    stopSpeaking();
    return;
  }
  
  try {
    isSpeaking.value = true;
    
    // Получаем URL аудиофайла
    const audioUrl = await synthesizeSpeech(text);
    
    // Создаем и воспроизводим аудио
    const audio = new Audio(audioUrl);
    currentAudio.value = audio;
    
    audio.addEventListener('ended', stopSpeaking);
    audio.addEventListener('error', stopSpeaking);
    
    await audio.play();
  } catch (error: any) {
    addMessage({
        summary: 'Ошибка воспроизведения речи',
        detail: 'Повторите попытку позже',
        severity: 'error'
    })
    console.error('Ошибка воспроизведения речи:', error);
    stopSpeaking();
  }
}

function stopSpeaking() {
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value.removeEventListener('ended', stopSpeaking);
    currentAudio.value.removeEventListener('error', stopSpeaking);
    currentAudio.value = null;
  }
  isSpeaking.value = false;
  currentSpeakingId.value = null;
}

function formatDate(date: string | Date): string {
  const isToday = new Date().toLocaleDateString('ru-RU') === new Date(date).toLocaleDateString('ru-RU');
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isToday ? dateObj.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }) : dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const scrollToBottom = () => {
  const messagesContainer = document.querySelector('.messages-container')
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }
}

defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.messages-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.message {
  padding: 12px;
  border-radius: 8px;
  max-width: 80%;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background-color: #cacaca;
  text-align: right;
}

.message.model {
  align-self: flex-start;
  background-color: #e3f2fd;
  text-align: left;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.8rem;
  color: #666;
}

.role {
  font-weight: bold;
  margin-right: 10px;
}

.message-content {
  word-break: break-word;
  color: #000;
  position: relative;
}

.speech-button {
  position: absolute;
  right: 40px;
  top: 7px;
}

.speech-button:hover {
  background-color: rgba(0, 119, 204, 0.1);
}

.speech-button:disabled {
  cursor: default;
  opacity: 0.5;
}

.no-messages {
  text-align: center;
  color: #666;
  padding: 20px;
}
</style>
