<template>
  <div class="characters-page">
    <div class="header">
      <h1 class="title">Библиотека персонажей</h1>
      <Button label="Создать персонажа" icon="pi pi-plus" @click="navigateToCreator" />
    </div>
    <div v-if="isCounterpartiesLoading" class="spinner-container">
      <ProgressSpinner />
    </div>
    <div v-else-if="isCounterpartiesError" class="error">
      {{ isCounterpartiesError }}
    </div>
    <div v-else class="grid">
      <CounterPartyCard
        v-for="character in characters"
        :key="character.id"
        :counterparty="character"
        :can-change-difficulty="false"
        class="clickable"
        @click="navigateToCharacter(character.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCounterparty } from '../../composables/useCounterparty';
import CounterPartyCard from '../../components/CounterPartyCard.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const { counterparties: characters, isCounterpartiesLoading, isCounterpartiesError, getCounterparties } = useCounterparty();
const router = useRouter();

const navigateToCreator = () => {
  router.push('/character-creator');
};

const navigateToCharacter = (id: string) => {
  router.push(`/scenario-groups?characterId=${id}`);
};

onMounted(getCounterparties);
</script>

<style scoped>
.characters-page {
  padding: 1rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.title {
  font-size: 1.5rem;
  font-weight: bold;
}
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.error {
  color: #ef4444; /* red-500 */
}
.grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style> 