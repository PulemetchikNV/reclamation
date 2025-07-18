<script setup lang="ts">
import { Drawer } from 'primevue';
import Header from './components/Header.vue';
import SidebarContent from './components/SidebarContent.vue';
import { isSidebarOpen } from './__data__/store';
import { provide, onMounted, watchEffect} from 'vue';
import { TOGGLE_SIDEBAR_KEY, API_URL_KEY } from './__data__/injectKeys';
import { useChat } from './composables/useChat';
import { isAuthorized } from './__data__/store';
import { useAuth } from './composables/useAuth';
import NotificationHandler from './components/NotificationHandler.vue';
const { getCurrentUser } = useAuth()
const { getChats } = useChat()

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

const apiUrl = import.meta.env.VITE_API_URL;

provide(TOGGLE_SIDEBAR_KEY, toggleSidebar)
provide(API_URL_KEY, apiUrl)

watchEffect(async () => {
  if(isAuthorized.value) {
    await getChats()
    await getCurrentUser()
  }
})
</script>

<template>
  <main class="main-layout">
    <div class="container">
      <header class="header-wrap">
        <Header />
      </header>
      <router-view />

      <template v-if="isAuthorized">
        <Drawer 
          v-model:visible="isSidebarOpen" 
          :modal="true"
          :showCloseIcon="true" 
          :position="'left'" 
          :style="{ width: '400px' }"
        >
          <SidebarContent />
        </Drawer>
      </template>
    </div>
    <NotificationHandler />
  </main>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.header-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.main-layout {
  padding-top: 100px;
  width: 100%;
}

.container {
  padding-inline: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    padding-inline: 10px;
  }
}



</style>
