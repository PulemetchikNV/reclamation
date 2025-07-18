<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue';
import type { CharacteristicsHistory, CharacteristicDynamic } from '../composables/useProfile';

const props = defineProps<{
    characteristicsHistory: CharacteristicsHistory
}>();

const emit = defineEmits<{
    'selectDynamic': [CharacteristicDynamic & { days?: number }]
}>();

// Структура для селектов категории и характеристики
const categories = {
    communicative: 'Коммуникативные',
    professional: 'Профессиональные',
    technical: 'Технические'
};

const characteristicLabels: Record<string, Record<string, string>> = {
    communicative: {
        friendly: 'Дружелюбность',
        listener: 'Слушание',
        confident: 'Уверенность',
        clear: 'Ясность',
        curious: 'Любознательность'
    },
    professional: {
        attentive: 'Внимательность',
        helpful: 'Отзывчивость',
        knowledge: 'Знания',
        ethical: 'Этичность',
        market: 'Понимание рынка'
    },
    technical: {
        demand: 'Выявление потребностей',
        qualityPresentation: 'Качество презентации',
        confrontation: 'Работа с возражениями',
        persuasion: 'Убеждение',
        initiative: 'Инициативность',
        techniques: 'Техники продажи'
    }
};

// Выбранная категория и характеристика
const selectedCategory = ref('communicative');
const selectedCharacteristic = ref('friendly');
const selectedPeriod = ref(5); // Новое состояние для выбранного периода

const periodOptions = [5, 10, 20]; // Опции для выбора периода

// Данные для графика
const chartData = computed(() => {
    if (!props.characteristicsHistory || 
        !props.characteristicsHistory[selectedCategory.value] || 
        !props.characteristicsHistory[selectedCategory.value][selectedCharacteristic.value]) {
        return { 
            labels: [], 
            values: [],
            groups: [],
            groupedDates: {}
        };
    }
    
    const historyData = props.characteristicsHistory[selectedCategory.value][selectedCharacteristic.value];
    const historyDataShorten = historyData.filter((_, index) => historyData.length - index <= selectedPeriod.value);

    // Фильтруем данные по выбранному периоду
    const filteredDataByPeriod = historyDataShorten.filter(item => {
        const itemDate = new Date(item.date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= selectedPeriod.value;
    });

    // Сортируем по дате
    const sortedData = [...filteredDataByPeriod].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Группируем данные по дням
    const groupedDates: Record<string, { date: Date, values: { time: string, value: number }[] }> = {};
    
    sortedData.forEach(item => {
        const date = new Date(item.date);
        const dateKey = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        const timeKey = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        if (!groupedDates[dateKey]) {
            groupedDates[dateKey] = {
                date,
                values: []
            };
        }
        
        groupedDates[dateKey].values.push({
            time: timeKey,
            value: item.value
        });
    });
    
    // Формируем данные для графика
    const labels: string[] = [];
    const values: number[] = [];
    const groups: string[] = [];
    
    Object.entries(groupedDates).forEach(([dateKey, dateData]) => {
        dateData.values.forEach(item => {
            labels.push(item.time);
            values.push(item.value);
            groups.push(dateKey);
        });
    });
    
    return { 
        labels, 
        values,
        groups,
        groupedDates
    };
});

// Данные для графика ApexCharts
const chartOptions = computed(() => ({
    chart: {
        type: 'bar',
        height: 350,
        toolbar: {
            show: false
        },
        group: 'charts'
    },
    colors: ['#4CAF50'],
    plotOptions: {
        bar: {
            borderRadius: 4,
            columnWidth: '60%',
            dataLabels: {
                position: 'top'
            }
        }
    },
    dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toFixed(1),
        offsetY: -20,
        style: {
            fontSize: '12px',
            colors: ["#304758"]
        }
    },
    title: {
        text: `Динамика характеристики "${getCharacteristicLabel()}"`,
        align: 'center',
        style: {
            fontSize: '16px',
            fontWeight: 'bold'
        }
    },
    xaxis: {
        categories: chartData.value.labels,
        group: {
            style: {
                fontSize: '12px',
                fontWeight: 600,
                colors: ['#333']
            },
            groups: createGroups()
        },
        labels: {
            style: {
                fontSize: '12px'
            }
        },
        position: 'bottom',
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        },
        crosshairs: {
            fill: {
                type: 'gradient',
                gradient: {
                    colorFrom: '#D8E3F0',
                    colorTo: '#BED1E6',
                    stops: [0, 100],
                    opacityFrom: 0.4,
                    opacityTo: 0.5,
                }
            }
        }
    },
    yaxis: {
        min: 0,
        max: 10,
        tickAmount: 5,
        title: {
            text: 'Значение'
        }
    },
    tooltip: {
        y: {
            formatter: (val: number) => val.toFixed(1)
        }
    }
}));

const series = computed(() => {
    return [{
        name: getCharacteristicLabel(),
        data: chartData.value.values
    }];
});

// Создаем группы для графика
function createGroups() {
    interface GroupItem {
        title: string;
        cols: number;
    }
    
    const result: GroupItem[] = [];
    let currentGroup = '';
    let startIndex = 0;
    
    chartData.value.groups.forEach((group, index) => {
        if (group !== currentGroup) {
            if (currentGroup !== '') {
                result.push({
                    title: currentGroup,
                    cols: index - startIndex
                });
            }
            currentGroup = group;
            startIndex = index;
        }
        
        // Добавляем последнюю группу
        if (index === chartData.value.groups.length - 1) {
            result.push({
                title: currentGroup,
                cols: chartData.value.groups.length - startIndex
            });
        }
    });
    
    return result;
}

// Получить метку для выбранной характеристики
function getCharacteristicLabel() {
    return characteristicLabels[selectedCategory.value]?.[selectedCharacteristic.value] || '';
}

// Обновление выбранной характеристики при смене категории
function updateCategory() {
    // Получаем первую характеристику из выбранной категории
    const characteristics = characteristicLabels[selectedCategory.value];
    if (characteristics) {
        selectedCharacteristic.value = Object.keys(characteristics)[0];
    }
}

watchEffect(() => {
    const characteristicHistoryForEmit = props.characteristicsHistory[selectedCategory.value]?.[selectedCharacteristic.value] || [];
    // Фильтруем данные для эмита так же, как для графика
    const filteredHistoryForEmit = characteristicHistoryForEmit.filter((_, index) => characteristicHistoryForEmit.length - index <= selectedPeriod.value);

    emit('selectDynamic', {
        characteristicName: selectedCharacteristic.value, 
        characteristicRus: getCharacteristicLabel(), 
        characteristicHistory: filteredHistoryForEmit,
    })
})
</script>

<template>
    <div class="user-characteristics-history">
        <div class="selection-controls">
            <div class="select-group">
                <label for="category-select">Категория:</label>
                <select 
                    id="category-select" 
                    v-model="selectedCategory" 
                    class="category-select"
                    @change="updateCategory"
                >
                    <option 
                        v-for="(label, value) in categories" 
                        :key="value" 
                        :value="value"
                    >
                        {{ label }}
                    </option>
                </select>
            </div>
            
            <div class="select-group">
                <label for="characteristic-select">Характеристика:</label>
                <select 
                    id="characteristic-select" 
                    v-model="selectedCharacteristic"
                    class="characteristic-select"
                >
                    <option 
                        v-for="(label, value) in characteristicLabels[selectedCategory]" 
                        :key="value" 
                        :value="value"
                    >
                        {{ label }}
                    </option>
                </select>
            </div>

            <div class="select-group">
                <label for="period-select">За последние:</label>
                <select 
                    id="period-select" 
                    v-model="selectedPeriod"
                    class="period-select characteristic-select" 
                >
                    <option 
                        v-for="period in periodOptions" 
                        :key="period" 
                        :value="period"
                    >
                        {{ period }} звонков
                    </option>
                </select>
            </div>
        </div>
        
        <div class="chart-container">
            <apexchart
                type="bar"
                height="350"
                :options="chartOptions"
                :series="series"
            ></apexchart>
        </div>

        <slot name="append"></slot>
        
        <div v-if="!chartData.values.length" class="no-data">
            <p>Нет данных для отображения</p>
        </div>
    </div>
</template>

<style scoped>
.user-characteristics-history {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.selection-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.select-group {
    display: flex;
    flex-direction: column;
    min-width: 200px;
}

.select-group label {
    font-size: 14px;
    color: #555;
    margin-bottom: 5px;
}

.category-select,
.characteristic-select,
.period-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
    background-color: #f9f9f9;
    cursor: pointer;
}

.chart-container {
    margin-top: 1rem;
}

.no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #888;
    font-style: italic;
}
</style>