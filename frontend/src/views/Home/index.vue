<script setup lang="ts">
import { Button } from 'primevue';
import { useRouter } from 'vue-router';
import { useChat } from '../../composables/useChat';
defineOptions({
    name: "HomePage"
})

const router = useRouter();

const { createChat, isCreateChatLoading } = useChat()

async function handleStartClick() {
    const newChat = await createChat()
    router.push(`/chat/${newChat?.id}`)
}
</script>

<template>
    <div>
        <h1>Home</h1>
        <Button 
            label="Начать новый чат" 
            icon="pi pi-add" 
            :loading="isCreateChatLoading" 
            @click="handleStartClick"
        />
    </div>
</template>