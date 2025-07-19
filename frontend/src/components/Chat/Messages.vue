<template>
  <div class="messages-container">
    <div v-for="message in messages" :key="message.id" :class="['message', messageClass(message)]">
      <div class="message-content">
        <Markdown :source="message.content" />
        <Button 
          v-if="message.role === 'model'" 
          :icon="isPlaying === message.id ? 'pi pi-stop-circle' : 'pi pi-play-circle'" 
          class="p-button-rounded p-button-text play-button"
          @click="synthesizeAndPlay(message)"
          v-tooltip.top="'Озвучить сообщение'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PropType } from 'vue';
import type { Message } from '../../../types/chat';
import Markdown from 'vue-markdown-it';
import Button from 'primevue/button';
import { axiosInstance } from '../../../plugins/axios';

const props = defineProps({
  messages: {
    type: Array as PropType<Message[]>,
    required: true
  },
  characterId: {
    type: String,
    required: true,
  }
});

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
    isPlaying.value = message.id;
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

const messageClass = (message: Message) => {
  return message.role === 'user' ? 'message-user' : 'message-model';
};
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
  padding-right: 2.5rem; /* Space for the button */
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

.play-button {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}
</style>
