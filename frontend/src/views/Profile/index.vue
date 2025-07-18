<template>
    <div class="profile">
        <h2 class="title mt-0 mb-0">Профиль</h2>
        <UserCharacteristics
            v-if="profileCharacteristics"
            :userCharacteristics="profileCharacteristics" 
        >
            <template #title>
                Ваша характеристика (последние 5 чатов)
            </template>
        </UserCharacteristics>

        <h3>История изменения</h3>
        <UserCharacteristcisHistory
            v-if="characteristicsHistory"
            :characteristicsHistory="characteristicsHistory"
            @selectDynamic="handleSelectDynamic"
        > 
            <template #append>
                <div
                    :severity="characteristicDynamic ? 'info' : 'info'"
                    :closable="false"
                    class="analysis-container"
                >
                    <VueMarkdown 
                        v-if="!isAnalyzeCharacteristicDynamicLoading && characteristicDynamic" 
                        :source="characteristicDynamic"
                    />
                    <p v-else-if="!isAnalyzeCharacteristicDynamicLoading && !characteristicDynamic">Анализ динамики не проведен</p>
                    <p v-else>Идет анализ...</p>
            </div>
            </template>
        </UserCharacteristcisHistory>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useProfile, type CharacteristicDynamic } from '../../composables/useProfile';
import UserCharacteristics from '../../components/UserCharacteristics.vue';
import UserCharacteristcisHistory from '../../components/UserCharacteristcisHistory.vue';
import { profileCharacteristics, characteristicsHistory } from '../../__data__/store';
import VueMarkdown from 'vue-markdown-render';

defineOptions({
    name: 'Profile'
})

const { getProfileCharacteristics, getCharacteristicsHistory, analyzeCharacteristicDynamic, isAnalyzeCharacteristicDynamicLoading } = useProfile();
const characteristicDynamic = ref<string | null>(null);

async function handleSelectDynamic(data: CharacteristicDynamic & { days?: number }) {
    characteristicDynamic.value = await analyzeCharacteristicDynamic(data);
}

onMounted(async () => {
    await getProfileCharacteristics();
    await getCharacteristicsHistory();
})
</script>

<style scoped>
.profile {
    display: flex;
    flex-direction: column;
}

.analysis-container {
    border: 1px solid blue;
    background-color: #f9f9f9;
    border-radius: 10px;
    padding-block: 10px;
    padding-inline: 20px;
    color: #333;
    text-align: left;
}
</style>