<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCounterparty } from '../../composables/useCounterparty';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import { Card } from 'primevue';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import { useChat } from '../../composables/useChat';
import { useApartament } from '../../composables/useApartament';
import { currentApartment, chat } from '../../__data__/store';
import ApartamentCard from '../../components/ApartamentCard.vue';
import CounterPartyCard from '../../components/CounterPartyCard.vue';
import { currentScenario, currentGroup, currentCounterparty } from '../../__data__/store';
import { getScenarioInfo, getClientType } from '../../utils/scenario';
import { useScenarios } from '../../composables/useScenarios';
import ScenarioCard from '../../components/ScenarioCard.vue';
import Chat from '../../components/Chat/index.vue';
import { addMessage } from '../../__data__/store';
import { chatList } from '../../__data__/store';
import AiHintButton from '../../components/AiHintButton.vue';

defineOptions({
    name: "CounterPartyRoute"
})

const route = useRoute();
const router = useRouter();
const { 
    getCounterparty, 
    isCounterpartyLoading,
    isCounterpartyError,
    deleteCounterparty,
    updateCounterparty,
    generateCounterparty,
    isGenerateCounterpartyLoading,
} = useCounterparty();
const { getScenario } = useScenarios();
const { getApartament, generateApartament, isGenerateApartamentLoading } = useApartament();
const { getChat, 
    createChat, 
    isCreateChatLoading, 
    updateChatTitle, 
    isUpdateChatTitleLoading, 
    finishChat, 
    isFinishChatLoading,
    getHint,
    isGetHintLoading
} = useChat();

const isEditTitle = ref(false);
const newTitle = ref('');
const isEnteringApartamentUrl = ref(false);
const apartamentUrl = ref('');
const chatId = computed(() => route.query.chatId as string);
const step = ref<'counterparty' | 'chat'>(chatId.value ? 'chat' : 'counterparty');
const chatRef = ref<InstanceType<typeof Chat> | null>(null);
 
// Получаем ID контрагента из параметров маршрута
const counterpartyId = computed(() => route.params.id as string);

// Функция получения данных о контрагенте
const loadCounterparty = async () => {
    const result = await getCounterparty(counterpartyId.value);
    if (!result) {
        router.push('/');
    }
};

const loadApartament = async () => {
    const apartamentId = route.query.apartamentId as string;
    const res = await getApartament(apartamentId);
    if(res) {
        currentApartment.value = res;
    }
}

const toggleDifficulty = async () => {
    if(step.value === 'chat') {
        return;
    }
    const currentDifficulty = currentCounterparty.value?.difficulty;
    const newDifficulty = currentDifficulty === 'easy' ? 'medium' : currentDifficulty === 'medium' ? 'hard' : 'easy';
    
    await updateCounterparty(counterpartyId.value, { difficulty: newDifficulty });
};

async function handleStartChat() {
    try {
        const chat = await createChat({
            counterpartyId: currentCounterparty.value?.id,
            scenarioId: route.params.scenarioId as string,
            apartmentId: currentApartment.value?.id
        })
        if(chat) {
            step.value = 'chat';
            router.push({ query: {
                ...route.query,
                chatId: chat.id
            } });
        }else{
            throw new Error('Не удалось создать чат');
        }
    } catch (error: any) {
        addMessage({
            summary: error.message,
            severity: 'error'
        })
        router.push({ query: {
            ...route.query,
            chatId: undefined
        } });
    }
}

const handleRefreshApartament = async (url?: string) => {
    if(typeof url === 'string') {
        url = url.trim();
    }
    if(url === '') {
        return;
    }
    const clientType = currentCounterparty.value?.type;
    const res = await generateApartament(
        getScenarioInfo(currentScenario.value!, currentGroup.value!),
        clientType,
        url
    );
    if(res) {
        currentApartment.value = res;
        router.replace({ query: { apartamentId: res.id } });
        addMessage({
            summary: 'Объект успешно обновлен',
            severity: 'success'
        })
    }
}

async function handleRefreshCounterparty() {
    const res = await generateCounterparty({type: currentCounterparty.value?.type});
    if(res) {
        currentCounterparty.value = res;
        router.replace({ params: {id: res.id}, query: {apartamentId: currentApartment.value?.id} });
        addMessage({
            summary: 'Контрагент успешно обновлен',
            severity: 'success'
        })
    }
}

async function handleTitleUpdate() {
    if (newTitle.value) {
        await updateChatTitle(route.query.chatId as string, newTitle.value)
        isEditTitle.value = false
        chatList.value = chatList.value.map(chat => chat.id === route.query.chatId ? { ...chat, title: newTitle.value } : chat);
    }
}

async function handleFinishChat() {
    await finishChat(chatId.value)
}

async function handleGetHint() {
    try {
        const {hint} = await getHint(chatId.value)
        if(hint && typeof hint === 'string') {
            chatRef.value?.setMessage(hint)
        }else{
            throw new Error('Не удалось получить подсказку')
        }
    } catch (error: any) {
        addMessage({
            summary: error.message,
            severity: 'error'
        })
    }
}

// Функция для возврата на предыдущую страницу
const goBack = () => {
    router.back();
};

onBeforeMount(async () => {
    loadCounterparty();
})


watchEffect(async () => {
    if(route.query.chatId) {
        step.value = 'chat';
        const chat = await getChat(chatId.value);
        if(chat) {
            chat.value = chat;
            newTitle.value = newTitle.value || chat.value.title;
        }
    }
})

watchEffect(() => {
    if(route.query.apartamentId) {
        loadApartament();
    }
})

watchEffect(async () => {
    await getScenario(route.params.scenarioId as string);
    currentGroup.value = currentScenario!.value?.group || null;
})

watch(() => route.params.id, () => {
    loadCounterparty();
})

watch(() => route.query.chatId, () => {
    if(route.query.chatId) {
        newTitle.value = '';
    }
}, {
    flush: 'pre'
})
</script>

<template>
    <div class="counterparty-page">
        <div class="counterparty-header header">
            <Button icon="pi pi-arrow-left" text @click="goBack" class="back-button" />
            <template v-if="step === 'counterparty'">
                <h1>Информация о контрагенте</h1>
            </template>
            <template v-else-if="step === 'chat'">
                <template v-if="!isEditTitle">
                    <h1 class="title">{{ chat?.title || 'Без названия' }}</h1>
                    <Button v-tooltip.top="'Редактировать название'" icon="pi pi-pencil" rounded text @click="isEditTitle = true" />
                    <div class="spacer"></div>
                </template>
                <template v-else>
                    <InputGroup @keydown.enter="handleTitleUpdate">
                        <InputText v-model="newTitle" />
                        <Button icon="pi pi-check" :loading="isUpdateChatTitleLoading" @click="handleTitleUpdate" />
                    </InputGroup>
                </template>
            </template>
            <div class="spacer"></div>
            <Button 
                v-if="step === 'counterparty'"
                label="Начать чат" 
                icon="pi pi-comments"
                :loading="isCreateChatLoading"
                :disabled="isGenerateApartamentLoading || isGenerateCounterpartyLoading"
                @click="handleStartChat"
            />
        </div>

        <!-- Индикатор загрузки -->
        <ProgressSpinner v-if="isCounterpartyLoading" />

        <!-- Сообщение об ошибке -->
        <Message v-if="isCounterpartyError" severity="error" :closable="false">
            {{ isCounterpartyError }}
        </Message>

        <!-- Контент при наличии данных -->
        <div v-if="currentCounterparty && !isCounterpartyLoading" class="counterparty-info content">
            
            <ApartamentCard
                v-if="currentApartment" 
                :apartment="currentApartment"
                class="counterparty-info-content"
            >
                <template #prepend>
                    <div class="header">
                        <p>{{ currentApartment.title }}</p>
                        <div class="spacer"></div>
                        <template v-if="step === 'counterparty'">
                            <Button 
                                v-tooltip.top="'Обновить объект'"
                                :loading="isGenerateApartamentLoading" 
                                icon="pi pi-refresh" 
                                outlined 
                                @click="handleRefreshApartament()" 
                            />
                            <Button 
                                v-tooltip.top="'Поиск объекта по ссылке'"
                                :icon="isEnteringApartamentUrl ? 'pi pi-times' : 'pi pi-search'" 
                                severity="info" 
                                @click="isEnteringApartamentUrl = !isEnteringApartamentUrl"
                            />
                        </template>
                    </div>
                    <div v-if="isEnteringApartamentUrl" class="url-box">
                        <InputGroup>
                            <InputText v-model="apartamentUrl" placeholder="Введите ссылку на объект" />
                            <Button 
                                label="Найти" 
                                :loading="isGenerateApartamentLoading"
                                @click="handleRefreshApartament(apartamentUrl)" 
                            />
                        </InputGroup>
                    </div>
                </template>
            </ApartamentCard>
            <Card v-else>
                <template #title>
                    <p>Объект не найден</p>
                </template>
                <template #content>
                    <div class="not-found-actions">
                        <Button label="Сгенерировать" :loading="isGenerateApartamentLoading" @click="handleRefreshApartament()" />
                        <Button 
                            v-tooltip.top="'Поиск объекта по ссылке'"
                            :icon="isEnteringApartamentUrl ? 'pi pi-times' : 'pi pi-search'"
                            severity="info" 
                            @click="isEnteringApartamentUrl = !isEnteringApartamentUrl"
                        />
                    </div>

                    <div v-if="isEnteringApartamentUrl" class="url-box">
                        <InputGroup>
                            <InputText v-model="apartamentUrl" placeholder="Введите ссылку на объект" />
                            <Button 
                                label="Найти" 
                                :loading="isGenerateApartamentLoading"
                                @click="handleRefreshApartament(apartamentUrl)" 
                            />
                        </InputGroup>
                    </div>
                </template>
            </Card>
            <div class="counterparty-info-right">
                <Chat
                    v-if="step === 'chat'"
                    :chatId="chatId"
                    :finishLoading="isFinishChatLoading"
                    ref="chatRef"
                    @finishChat="handleFinishChat"
                >
                    <template #headerActions>
                        <AiHintButton v-if="!chat?.isFinished" :loading="isGetHintLoading" @getHint="handleGetHint" />
                    </template>
                </Chat>
                <CounterPartyCard
                    :counterparty="currentCounterparty"
                    :can-change-difficulty="step === 'counterparty'"
                    class="counterparty-info-content"
                    @toggleDifficulty="toggleDifficulty"
                >
                    <template #icons>
                        <Button 
                            v-if="step === 'counterparty'"
                            v-tooltip.top="'Обновить контрагента'"
                            icon="pi pi-refresh" 
                            rounded 
                            text 
                            :loading="isGenerateCounterpartyLoading" 
                            @click="handleRefreshCounterparty" 
                        />
                    </template>
                </CounterPartyCard>
                <ScenarioCard v-if="currentScenario" :scenario="currentScenario" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.counterparty-page {
    margin: 0 auto;
    padding: 2rem;
    padding-bottom: 240px;
}

.counterparty-header {
    margin-bottom: 2rem;
}

.header h1 {
    margin: 0;
    font-size: 1.75rem;
    text-align: start;
}

.back-button {
    margin-right: 0.5rem;
}
:deep(.main-photo img) {
    object-fit: cover;
    object-position: center;
}

.title-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.title-container .name {
    margin: 0;
    font-size: 1.5rem;
}
.counterparty-info {
    display: grid;
    grid-template-columns: 50% 50%;
    align-items: start;
    gap: 1rem;
}

.counterparty-info-content {
}

.counterparty-info-right {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.not-found-actions {
    display: flex;
    justify-content: center;
    gap: 5px;
}

.url-box {
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .counterparty-page {
        padding: 0;
        padding-bottom: 120px;
    }
    .counterparty-info {
        display: flex;
        flex-direction: column-reverse;
        max-width: 100%;
    }
    .counterparty-info-content {
        width: 100%;
    }
    .counterparty-info-right {
        width: 100%;
    }
    .header h1 {
        font-size: 1.5rem;
    }
}

@media (max-width: 480px) {
    .header h1 {
        font-size: 1.25rem;
    }
}
</style>
