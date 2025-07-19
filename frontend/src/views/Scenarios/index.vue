

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScenarios } from '../../composables/useScenarios';
import { useCounterparty } from '../../composables/useCounterparty';
import CounterPartyCard from '../../components/CounterPartyCard.vue';
import { useApartament } from '../../composables/useApartament';
import Dialog from 'primevue/dialog';

// Компоненты PrimeVue
import DataView from 'primevue/dataview';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import {API_URL_KEY} from '../../__data__/injectKeys'
import { getStaticUrl } from '../../utils';
import { addMessage } from '../../__data__/store';

const route = useRoute();
const router = useRouter();
const { 
  getGroupScenarios, 
  currentGroup, 
  scenarios,
  isGroupScenariosLoading, 
  isGroupScenariosError
} = useScenarios();
const { 
  getCounterparties,
  counterparties,
  isCounterpartiesLoading 
} = useCounterparty();

const {generateApartament, isGenerateApartamentLoading} = useApartament();

let apiUrl = inject(API_URL_KEY);
let staticUrl = getStaticUrl(apiUrl!);

const isDialogVisible = ref(false);
const characterId = ref<string | null>(null);

const startChat = async (scenarioId: string) => {
  if (!characterId.value) {
    addMessage({
      summary: 'Персонаж не выбран',
      detail: 'Невозможно начать чат без выбранного персонажа.',
      severity: 'error'
    });
    return;
  }

  const groupScenario = scenarios.value.find(s => s.id === scenarioId);
  if (!groupScenario) return;

  try {
    const apartament = await generateApartament(groupScenario);
    if (apartament) {
      router.push(`/scenario/${scenarioId}/counterparty/${characterId.value}?apartamentId=${apartament.id}`);
    } else {
      throw new Error('Ошибка при генерации контекста сценария');
    }
  } catch (error: any) {
    addMessage({
      summary: 'Что-то пошло не так',
      detail: error.message,
      severity: 'error'
    });
  }
};

const openCharacterDialog = async () => {
  await getCounterparties();
  isDialogVisible.value = true;
};

const handleCharacterChange = (newCharacterId: string) => {
  characterId.value = newCharacterId;
  router.replace({ query: { ...route.query, characterId: newCharacterId } });
  isDialogVisible.value = false;
};

// Возврат на страницу со списком групп
const goBack = () => {
  const query = characterId.value ? `?characterId=${characterId.value}` : '';
  router.push(`/scenario-groups${query}`);
};

// Загрузка сценариев для выбранной группы
onMounted(async () => {
  characterId.value = route.query.characterId as string | null;
  const groupId = route.params.id as string;

  if (!characterId.value) {
    addMessage({ severity: 'warn', summary: 'Персонаж не выбран', detail: 'Возвращаем к выбору персонажа...', life: 3000 });
    router.push('/characters');
    return;
  }
  
  if (groupId) {
    await getGroupScenarios(groupId as string);
  }
});
</script>

<template>
  <div class="scenarios-container">
    <div class="header">
      <Button 
        icon="pi pi-arrow-left" 
        class="back-button" 
        @click="goBack" 
      />
      <div class="header-content">
        <h1 class="page-title">{{ currentGroup?.title || 'Сценарии' }}</h1>
        <Button 
          label="Поменять персонажа" 
          link 
          class="change-character-button"
          @click="openCharacterDialog" 
        />
      </div>
    </div>

    <p v-if="currentGroup?.description" class="group-description">
      {{ currentGroup.description }}
    </p>

    <!-- Индикатор загрузки -->
    <ProgressSpinner v-if="isGroupScenariosLoading" class="loader" />

    <!-- Сообщение об ошибке -->
    <Message v-if="isGroupScenariosError" severity="error" :closable="false" class="error-message">
      {{ isGroupScenariosError }}
    </Message>

    <!-- Список сценариев -->
    <DataView
      v-if="scenarios.length > 0"
      :value="scenarios"
      layout="grid"
      dataKey="id"
      :pt="{content: {style: {backgroundColor: 'transparent'}}}"
    >
      <template #grid="slotProps">
        <div class="scenarios-wrapper">
          <div 
            v-for="scenario in slotProps.items" 
            :key="scenario.id" 
            class="scenario-card"
            @click="startChat(scenario.id)"
          >
            <div class="scenario-image-container">
              <img 
                :src="(staticUrl + scenario.imageUrl)" 
                :alt="scenario.title" 
                class="scenario-image"
              />
            </div>
            
            <div class="scenario-content">
              <h3 class="scenario-title">{{ scenario.title }}</h3>
              <p class="scenario-description">
                {{ scenario.description }}
              </p>
            </div>
          </div>
        </div>
      </template>
      
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-file empty-icon"></i>
          <h3 class="empty-title">Нет доступных сценариев</h3>
          <p class="empty-message">В данной группе пока нет сценариев</p>
        </div>
      </template>
    </DataView>
    <Dialog 
      :visible="isDialogVisible" 
      @update:visible="isDialogVisible = false"
      modal 
      header="Поменять персонажа"
      :style="{ width: '90vw', maxWidth: '800px' }"
      :pt="{
        root: { class: 'characters-dialog' },
        header: { class: 'characters-dialog-header' },
        content: { class: 'characters-dialog-content' }
      }"
    >
      <div v-if="isCounterpartiesLoading" class="loader-dialog">
        <ProgressSpinner />
      </div>
      <div v-else class="characters-grid">
        <CounterPartyCard
          v-for="character in counterparties"
          :key="character.id"
          :counterparty="character"
          :can-change-difficulty="false"
          @click="handleCharacterChange(character.id)"
          class="character-selection-card"
        />
      </div>
    </Dialog>
    <Dialog :visible="isGenerateApartamentLoading" :modal="true" :draggable="false" :resizable="false">
      <div class="generation-dialog">
        <ProgressSpinner style="width: 30px; height: 30px" />
        <p>Генерация контекста для сценария...</p>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.scenarios-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.back-button {
  margin-right: 0.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: bold;
  display: inline-block;
  margin: 0;
}

.change-character-button {
  padding: 0;
  margin-top: -5px;
  font-size: 0.9rem;
  font-weight: normal;
}

.group-description {
  color: #4b5563;
  margin-bottom: 1rem;
}

.loader {
  display: block;
  margin: 2rem auto;
  width: 2.5rem;
  height: 2.5rem;
}

.error-message {
  margin-bottom: 1rem;
}

.scenarios-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.scenario-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.scenario-card:hover {
  border-color: var(--primary-color, #4318FF);
  transform: translateY(-4px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.scenario-image-container {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.scenario-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scenario-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.scenario-title {
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.scenario-description {
  font-size: 0.875rem;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
}

.empty-icon {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-message {
  color: #6b7280;
}

.loader-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.character-selection-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.character-selection-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.generation-dialog {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.25rem;
    text-align: start;
  }
  .group-description {
    text-align: start;
  }
  .scenarios-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
<style>
.characters-dialog .p-dialog-header {
  padding: 1rem 1.5rem;
}
.characters-dialog .p-dialog-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background-color: #f8f9fa;
}
</style>
