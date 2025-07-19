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
        @click="navigateToCharacterScenarios(character.id)"
      >
        <template #actions>
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click.stop="navigateToEditor(character.id)" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click.stop="confirmDelete(character.id)" />
        </template>
      </CounterPartyCard>
    </div>
     <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCounterparty } from '../../composables/useCounterparty';
import CounterPartyCard from '../../components/CounterPartyCard.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from 'primevue/confirmdialog';
import { addMessage } from '../../__data__/store';


const { 
  counterparties: characters, 
  isCounterpartiesLoading, 
  isCounterpartiesError, 
  getCounterparties,
  deleteCounterparty
} = useCounterparty();

const router = useRouter();
const confirm = useConfirm();

const navigateToCreator = () => {
  router.push('/character-creator');
};

const navigateToEditor = (id: string) => {
  router.push(`/character-creator/${id}`);
};

const navigateToCharacterScenarios = (id: string) => {
  router.push(`/scenario-groups?characterId=${id}`);
};

const confirmDelete = (id: string) => {
    confirm.require({
        message: 'Вы уверены, что хотите удалить этого персонажа? Это действие необратимо.',
        header: 'Подтверждение удаления',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Удалить',
        rejectLabel: 'Отмена',
        acceptClass: 'p-button-danger',
        accept: async () => {
            const success = await deleteCounterparty(id);
            if (success) {
              addMessage({ severity: 'success', summary: 'Успешно', detail: 'Персонаж удален', life: 3000 });
              await getCounterparties(); // Обновляем список
            }
        },
    });
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}
</style> 