

<script setup lang="ts">
import { inject, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScenarios } from '../../composables/useScenarios';
import { useCounterparty } from '../../composables/useCounterparty';

// Компоненты PrimeVue
import DataView from 'primevue/dataview';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Dialog from 'primevue/dialog';
import { useApartament } from '../../composables/useApartament';
import { getScenarioInfo, getClientType } from '../../utils/scenario';
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
const {generateCounterparty, isGenerateCounterpartyLoading} = useCounterparty();
const {generateApartament, isGenerateApartamentLoading} = useApartament();

const fallbackImage = 'https://placehold.co/300x150'
// Получение ID группы из параметров маршрута
const groupId = route.params.id;
let apiUrl = inject(API_URL_KEY);
let staticUrl = getStaticUrl(apiUrl!);

// Возврат на страницу со списком групп
const goBack = () => {
  router.push('/scenario-groups');
};

const handleScenarioClick = async (scenarioId: string) => {
    const type = getClientType(currentGroup.value!);
    const groupScenario = currentGroup.value?.scenarios?.find(s => s.id === scenarioId);
    const scenarioInfo = getScenarioInfo(groupScenario!, currentGroup.value!);

    try {
      const [counterparty, apartament] = await Promise.all([
        generateCounterparty({type}), 
        generateApartament(scenarioInfo, type)
      ]);

      if(counterparty) await router.push(`/scenario/${scenarioId}/counterparty/${counterparty?.id}?apartamentId=${apartament?.id}`);
      else throw new Error('Ошибка при генерации контрагента');
    } catch (error: any) {
      addMessage({
        summary: 'Что-то пошло не так',
        detail: error.message,
        severity: 'error'
      })
    }
}
// Загрузка сценариев для выбранной группы
onMounted(async () => {
  if (groupId) {
    await getGroupScenarios(groupId as string);
  }
})
</script>

<template>
  <div class="scenarios-container">
    <div class="header">
      <Button 
        icon="pi pi-arrow-left" 
        class="back-button" 
        @click="goBack" 
      />
      <h1 class="page-title">{{ currentGroup?.title || 'Сценарии' }}</h1>
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
            @click="handleScenarioClick(scenario.id)"
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
    <Dialog :visible="isGenerateCounterpartyLoading || isGenerateApartamentLoading" :modal="true" :draggable="false" :resizable="false">
      <p v-if="isGenerateCounterpartyLoading">Генерация контрагента...</p>
      <p v-else-if="isGenerateApartamentLoading">Генерация объекта недвижимости...</p>
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

.back-button {
  margin-right: 0.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: bold;
  display: inline-block;
}

.group-description {
  color: #4b5563;
  margin-bottom: 1rem;
}

.loader {
  width: 2.5rem;
  height: 2.5rem;
}

.error-message {
  margin-bottom: 1rem;
}

.scenarios-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.scenario-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scenario-card:hover {
  border-color: var(--primary-color, #4318FF);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.scenario-image-container {
  margin-bottom: 0.75rem;
}

.scenario-image {
  width: 100%;
  height: 10rem;
  object-fit: cover;
  border-radius: 0.5rem;
}

.scenario-content {
  flex: 1;
  display: flex;
  flex-direction: column;
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

@media (max-width: 480px) {
  .page-title {
    font-size: 1.25rem;
    text-align: start;
  }
  .group-description {
    text-align: start;
  }
}
</style>
