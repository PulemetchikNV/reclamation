<template>
  <div class="scenario-groups-container">
    <div class="header">
        <h1 class="page-title">Группы сценариев</h1>
    </div>

    <!-- Индикатор загрузки -->
    <ProgressSpinner v-if="isGroupsLoading" class="loader" />

    <!-- Сообщение об ошибке -->
    <Message v-if="isGroupsError" severity="error" :closable="false" class="error-message">
      {{ isGroupsError }}
    </Message>

    <!-- Группы сценариев -->
    <DataView 
        :value="scenarioGroups"
        :paginator="scenarioGroups.length > 9" 
        :rows="9" 
        layout="grid"
        :pt="{content: {style: {backgroundColor: 'transparent'}}}"
    >
      <template #grid="slotProps">
            <div 
                v-for="group in slotProps.items" 
                :key="group.id" 
                class="group-item"
                @click="navigateToScenarios(group.id)"
            >
                <div class="group-content">
                    <div class="group-info">
                      <h2 class="group-title">{{ group.title }}</h2>
                      <p v-if="group.description" class="group-description">{{ group.description }}</p>
                    </div>
                    <div class="group-meta">
                    <span class="scenarios-count">{{ group.scenarios?.length || 0 }} сценариев</span>
                    <i class="pi pi-chevron-right"></i>
                    </div>
                </div>
            </div>
      </template>
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-folder-open empty-icon"></i>
          <h3 class="empty-title">Нет доступных групп сценариев</h3>
          <p class="empty-message">В базе данных пока нет групп сценариев</p>
        </div>
      </template>
    </DataView>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScenarios } from '../../composables/useScenarios';

// Компоненты PrimeVue
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import DataView from 'primevue/dataview';

const router = useRouter();
const { getScenarioGroups, scenarioGroups, isGroupsLoading, isGroupsError } = useScenarios();

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await getScenarioGroups();
});

// Навигация к странице сценариев выбранной группы
const navigateToScenarios = (groupId) => {
  router.push(`/scenario-group/${groupId}`);
};
</script>

<style scoped>
.scenario-groups-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.loader {
  width: 2.5rem;
  height: 2.5rem;
}

.error-message {
  margin-bottom: 1rem;
}

.groups-wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.group-item {
  background-color: #fff;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-item:hover {
  border-color: var(--primary-color, #4318FF);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.group-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-title {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: start;
}

.group-description {
  color: #4b5563;
  margin-top: 0.25rem;
}

.group-meta {
  display: flex;
  align-items: center;
}

.scenarios-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin-right: 0.5rem;
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
  .scenario-groups-container {
    padding: 5px;
  }
  .group-description {
    text-align: start;
  }
  .group-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .group-meta {
    margin-top: 10px;
  }
}
</style>
