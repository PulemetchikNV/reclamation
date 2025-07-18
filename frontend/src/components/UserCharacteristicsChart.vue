<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UserCharacteristics } from '../types/chat';

const props = defineProps<{
    userCharacteristics: UserCharacteristics
}>();

const activeTab = ref('communicative');

const tabs = [
    { key: 'communicative', name: 'Коммуникативные' },
    { key: 'professional', name: 'Профессиональные' },
    { key: 'technical', name: 'Технические' }
];

const chartOptions = computed(() => ({
    chart: {
        type: 'radar',
        toolbar: {
            show: false
        }
    },
    colors: ['#4CAF50'],
    plotOptions: {
        radar: {
            polygons: {
                strokeColors: '#e8e8e8',
                fill: {
                    colors: ['#f8f8f8', '#fff']
                }
            }
        }
    },
    title: {
        text: getTabTitle(activeTab.value),
        align: 'center',
        style: {
            fontSize: '16px',
            fontWeight: 'bold'
        }
    },
    xaxis: {
        categories: getLabels(activeTab.value),
        labels: {
            style: {
                fontSize: '12px',
                fontFamily: 'Helvetica, Arial, sans-serif'
            }
        }
    },
    yaxis: {
        min: 0,
        max: 10,
        tickAmount: 5
    },
    markers: {
        size: 4,
        hover: {
            size: 6
        }
    },
    tooltip: {
        y: {
            formatter: (val: number) => val.toFixed(1)
        }
    }
}));

const series = computed(() => {
    return [
        {
            name: 'Значение',
            data: getValues(activeTab.value)
        }
    ];
});

function getLabels(category: string) {
    switch (category) {
        case 'communicative':
            return ['Дружелюбность', 'Слушание', 'Уверенность', 'Ясность', 'Любознательность'];
        case 'professional':
            return ['Внимательность', 'Отзывчивость', 'Знания', 'Этичность', 'Понимание рынка'];
        case 'technical':
            return ['Конкретность', 'Качество подачи', 'Работа с возражениями', 'Убеждение', 'Инициативность', 'Техники'];
        default:
            return [];
    }
}

function getTabTitle(category: string) {
    switch (category) {
        case 'communicative':
            return 'Коммуникативные навыки';
        case 'professional':
            return 'Профессиональные качества';
        case 'technical':
            return 'Технические умения';
        default:
            return '';
    }
}

function getValues(category: string) {
    switch (category) {
        case 'communicative':
            return [
                props.userCharacteristics.communicative.friendly || 0,
                props.userCharacteristics.communicative.listener || 0,
                props.userCharacteristics.communicative.confident || 0,
                props.userCharacteristics.communicative.clear || 0,
                props.userCharacteristics.communicative.curious || 0
            ];
        case 'professional':
            return [
                props.userCharacteristics.professional.attentive || 0,
                props.userCharacteristics.professional.helpful || 0,
                props.userCharacteristics.professional.knowledge || 0,
                props.userCharacteristics.professional.ethical || 0,
                props.userCharacteristics.professional.market || 0
            ];
        case 'technical':
            return [
                props.userCharacteristics.technical.demand || 0,
                props.userCharacteristics.technical.qualityPresentation || 0,
                props.userCharacteristics.technical.confrontation || 0,
                props.userCharacteristics.technical.persuasion || 0,
                props.userCharacteristics.technical.initiative || 0,
                props.userCharacteristics.technical.techniques || 0
            ];
        default:
            return [];
    }
}
</script>

<template>
    <div class="user-characteristics-chart">
        <div class="tabs">
            <button 
                v-for="tab in tabs" 
                :key="tab.key" 
                @click="activeTab = tab.key" 
                :class="{ active: activeTab === tab.key }"
                class="tab-button"
            >
                {{ tab.name }}
            </button>
        </div>
        
        <div class="chart-container">
            <apexchart
                type="radar"
                height="350"
                :options="chartOptions"
                :series="series"
            ></apexchart>
        </div>
        
        <div class="values-list">
            <div v-for="(value, index) in getValues(activeTab)" :key="index" class="value-item">
                <div class="value-label">{{ getLabels(activeTab)[index] }}</div>
                <div class="value-bar">
                    <div class="value-progress" :style="{ width: `${value * 10}%` }"></div>
                </div>
                <div class="value-number">{{ value.toFixed(1) }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-characteristics-chart {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.tabs {
    display: flex;
    margin-bottom: 1rem;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 0.5rem;
    max-width: 100%;
    overflow-x: auto;
}

.tab-button {
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: #666;
    border-radius: 4px;
    transition: all 0.2s;
}

.tab-button.active {
    background-color: #4CAF50;
    color: white;
    font-weight: 500;
}

.tab-button:hover:not(.active) {
    background-color: #f0f0f0;
}

.chart-container {
    margin-bottom: 1.5rem;
}

.values-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}

.value-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
}

.value-label {
    width: 40%;
    font-size: 0.85rem;
    color: #555;
}

.value-bar {
    width: 50%;
    height: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
    margin: 0 0.5rem;
    overflow: hidden;
}

.value-progress {
    height: 100%;
    background-color: #4CAF50;
    border-radius: 4px;
}

.value-number {
    width: 10%;
    font-size: 0.85rem;
    font-weight: 500;
    color: #333;
    text-align: right;
}
</style> 