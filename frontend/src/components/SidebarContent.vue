<template>
    <div class="sidebar-content">
        <RouterLink to="/characters" @click="toggleSidebar?.()">
            <Button label="Библиотека персонажей" icon="pi pi-users" class="w-full" />
        </RouterLink>
        <ChatHistory :chats="chatList" :loading="isGetChatsLoading" />
        <div class="spacer"></div>
        <UserDisplay v-if="user" @click="handleUserDisplayClick" />
        <LogoutButton />
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { TOGGLE_SIDEBAR_KEY } from '../__data__/injectKeys';
import { chatList, user } from '../__data__/store';
import { useChat } from '../composables/useChat';
import ChatHistory from './ChatHistory.vue';
import LogoutButton from './LogoutButton.vue';
import UserDisplay from './UserDisplay.vue';
import Button from 'primevue/button';

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