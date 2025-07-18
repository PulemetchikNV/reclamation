<script setup lang="ts">
import { computed, inject } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { TOGGLE_SIDEBAR_KEY } from '../__data__/injectKeys';
import type { ChatHistoryItem } from '../types/chat';

const props = defineProps<{
  chats: ChatHistoryItem[];
  activeChat?: string | number;
  maxHeight?: number;
  loading?: boolean;
}>();

const router = useRouter()

function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  
  const isToday = new Date().toLocaleDateString('ru-RU') === new Date(date).toLocaleDateString('ru-RU');
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isToday ? dateObj.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }) : dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

const toggleSidebar = inject(TOGGLE_SIDEBAR_KEY)

const handleSelectChat = (chat: ChatHistoryItem) => {
  router.push(`/scenario/${chat.scenario.id}/counterparty/${chat.counterparty.id}?apartamentId=${chat.apartment.id}&chatId=${chat.id}`)
  toggleSidebar?.()
}
</script>

<template>
  <div 
    class="chat-history"
    :style="{ maxHeight: maxHeight ? `${maxHeight}px` : 'auto' }"
  >
    <p v-if="loading">Загрузка...</p>
    <template v-else>
      <div
        v-for="chat in chats"
        :key="chat.id"
        class="chat-item"
        :class="{ active: chat.id === activeChat }"
        @click="handleSelectChat(chat)"
      >
        <div class="chat-title">{{ chat.title || 'Без названия' }}</div>
        <div v-if="chat.createdAt" class="chat-date">{{ formatDate(chat.createdAt) }}</div>
      </div>
      <div v-if="chats.length === 0" class="no-chats">
        <div class="no-chats-text">
          <p>История чатов пуста</p>
          <RouterLink 
            to="/" 
            class="no-chats-text-description"
            @click="toggleSidebar"
          >
            Создайте новый чат
          </RouterLink>
          </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chat-history {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding: 10px;
}

.chat-item {
  padding: 12px;
  border-radius: 8px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.chat-item:hover {
  background-color: #ececec;
}

.chat-item.active {
  background-color: #e3f2fd;
  border-left: 3px solid #2757FC;
}

.chat-title {
  font-weight: 500;
  color: #333;
  word-break: break-word;
}

.chat-date {
  font-size: 0.8rem;
  color: #666;
}

.no-chats {
  text-align: center;
  color: #666;
  padding: 20px;
}


.no-chats-text-description {
  font-size: 0.8rem;
  color: #666;
  font-weight: bold;
}
</style>
