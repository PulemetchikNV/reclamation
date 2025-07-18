<script setup lang="ts">
import Card from 'primevue/card';
import type { Scenario } from '../types/scenario';

defineOptions({
    name: 'ScenarioCard'
})

defineProps<{
    scenario: Scenario
}>()
</script>

<template>
    <Card :pt="{body: {style: {paddingTop: '0rem'}}}">
        <template #header>
            <h3 class="scenario-card-title">{{scenario.group?.title}}</h3>
        </template>
        <template #content>
            <div class="scenario-card">
                <p class="scenario-card-description">Сценарий: {{ scenario.title }}</p>
                <p class="scenario-card-description">Описание: {{ scenario.description }}</p>
            </div>
        </template>
    </Card>
</template>

<style scoped>
.scenario-card {
    text-align: left;
}

.scenario-card-title {
    font-size: 1rem;
    font-weight: 600;
}

.scenario-card-description {
    font-size: 1rem;
    color: var(--text-color);
}
</style>