<template>
    <div class="sidebar-content">
        <ChatHistory :chats="chatList" :loading="isGetChatsLoading" />
        <div class="spacer"></div>
        <UserDisplay v-if="user" @click="handleUserDisplayClick" />
        <LogoutButton />
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import { TOGGLE_SIDEBAR_KEY } from '../__data__/injectKeys';
import { chatList, user } from '../__data__/store';
import { useChat } from '../composables/useChat';
import ChatHistory from './ChatHistory.vue';
import LogoutButton from './LogoutButton.vue';
import UserDisplay from './UserDisplay.vue';

const { isGetChatsLoading } = useChat()

const router = useRouter()

const toggleSidebar = inject(TOGGLE_SIDEBAR_KEY)

const handleUserDisplayClick = () => {
    router.push('/profile')
    toggleSidebar?.()
}
</script>

<style scoped>
.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}
</style>