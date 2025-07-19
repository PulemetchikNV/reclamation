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
          v-if="message.role === 'model'" 
          :icon="isPlaying === message.id ? 'pi pi-stop-circle' : 'pi pi-play-circle'" 
          class="p-button-rounded p-button-text play-button"
          v-tooltip.top="'Озвучить сообщение'"
          @click="synthesizeAndPlay(message)"
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
import Button from 'primevue/button';
import { axiosInstance } from '../../plugins/axios.js';

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
  characterId: string;
}>();

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

const isPlaying = ref<string | null>(null);
const audio = new Audio();

const synthesizeAndPlay = async (message: Message) => {
  if (isPlaying.value === message.id) {
    audio.pause();
    audio.currentTime = 0;
    isPlaying.value = null;
    return;
  }

  try {
    isPlaying.value = message.id as string;
    const response = await axiosInstance.post('/api/voice/synthesize', {
      text: message.content,
      characterId: props.characterId
    }, {
      responseType: 'blob'
    });

    const audioUrl = URL.createObjectURL(response.data);
    audio.src = audioUrl;
    audio.play();

    audio.onended = () => {
      isPlaying.value = null;
      URL.revokeObjectURL(audioUrl);
    };

  } catch (error) {
    console.error('Ошибка синтеза речи:', error);
    isPlaying.value = null;
  }
};

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
