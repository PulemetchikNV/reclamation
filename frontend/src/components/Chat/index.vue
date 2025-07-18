<script setup lang="ts">
import {Card} from "primevue";
import Messages from "./Messages.vue";
import ChatAnalysis from "../../components/ChatAnalysis.vue";
import { useChat } from "../../composables/useChat";
import { chat } from "../../__data__/store";
import { ref } from "vue";
import { Textarea, InputGroup, Button, IconField } from "primevue";
import UserCharacteristics from "../../components/UserCharacteristics.vue";
import TranscribeButton from "../../components/TranscribeButton.vue";

defineOptions({
    name: "ChatRoute"
})

defineProps<{
    chatId: string
    finishLoading: boolean
}>()

defineEmits<{
    'finishChat': []
}>()

const { 
    sendMessage, 
    isSendMessageLoading,
} = useChat()

const message = ref('')
const messagesRef = ref<InstanceType<typeof Messages> | null>(null)

const handleSendMessage = async () => {
    await sendMessage(message.value)
    message.value = ''
    scrollToBottom()
}

const handleTranscribeFinished = (text: string) => {
    message.value = text
}

function scrollToBottom() {
    messagesRef.value?.scrollToBottom()
}

function setMessage(msgText: string) {
    message.value = msgText
}

defineExpose({
    setMessage
})
</script>

<template>
    <div class="chat-wrapper">
        <ChatAnalysis v-if="chat?.analysis" :analysis="chat.analysis" />
        <UserCharacteristics v-if="chat?.analysis" :userCharacteristics="chat.analysis.userCharacteristics" />
        <div class="container">
            <Card :pt="{header: {style: {paddingInline: '30px'}}}">
                <template #header>
                    <div class="header">
                        <h5>Чат с {{ chat?.counterparty.name }}</h5>
                        <div class="spacer" />
                        <slot name="headerActions" />
                        <Button
                            v-if="!chat?.isFinished"
                            :loading="finishLoading"
                            icon="pi pi-phone"
                            severity="danger"
                            rounded
                            text
                            @click="$emit('finishChat')"
                        />
                    </div>
                </template>
                <template #content>
                    <div class="wrapper" @keydown.enter="handleSendMessage">
                        <Messages
                            :maxHeight="500"
                            :messages="chat?.messages || []"
                            ref="messagesRef"
                            class="messages"
                        />

                        <InputGroup>
                            <TranscribeButton 
                                :disabled="chat?.isFinished"
                                @transcribeFinished="handleTranscribeFinished"
                            />
                            <Textarea
                                v-model="message"
                                style="width: 100%;"
                                :disabled="chat?.isFinished"
                                :placeholder="chat?.isFinished ? 'Чат завершен' : 'Введите сообщение'"
                            />
                            <Button icon="pi pi-send" :loading="isSendMessageLoading" @click="handleSendMessage" />
                        </InputGroup>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0 auto;
}

.messages {
    margin-bottom: 20px;
}
</style>