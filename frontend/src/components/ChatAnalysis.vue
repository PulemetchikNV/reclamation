<template>
  <div class="chat-analysis" v-if="analysis">
    <div class="analysis-card">
      <div class="analysis-header">
        <h3>Анализ диалога</h3>
        <div class="rating-badge" :class="ratingClass">
          <span>Оценка: {{ analysis.rating }}</span>
        </div>
      </div>
      
      <div class="analysis-content">
        <div class="analysis-section" v-if="analysis.goodSides.length > 0">
          <h4><i class="positive-icon">✓</i> Положительные стороны</h4>
          <ul class="sides-list positive">
            <li v-for="(side, index) in analysis.goodSides" :key="index">
              {{ side }}
            </li>
          </ul>
        </div>
        
        <div class="analysis-section" v-if="analysis.badSides.length > 0">
          <h4><i class="negative-icon">✗</i> Отрицательные стороны</h4>
          <ul class="sides-list negative">
            <li v-for="(side, index) in analysis.badSides" :key="index">
              {{ side }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatAnalysis } from '../types/chat.ts';
import { computed } from 'vue';

const props = defineProps<{
  analysis: ChatAnalysis
}>();

const ratingClass = computed(() => {
  const rating = props.analysis?.rating || 0;
  if (rating >= 8) return 'rating-high';
  if (rating >= 5) return 'rating-medium';
  return 'rating-low';
});
</script>

<style scoped>
.chat-analysis {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.analysis-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e9ecef;
  background-color: #fff;
}

.analysis-header {
  padding: 1rem 1.5rem;
  background-color: #fff;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #343a40;
}

.rating-badge {
  padding: 0.35rem 0.7rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.rating-high {
  background-color: #40c057;
}

.rating-medium {
  background-color: #fd7e14;
}

.rating-low {
  background-color: #fa5252;
}

.analysis-content {
  padding: 1rem 1.5rem 1.5rem;
}

.analysis-section {
  margin-bottom: 1.25rem;
  text-align: start;
}

.analysis-section h4 {
  margin: 0.75rem 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
}

.positive-icon {
  color: #40c057;
  font-style: normal;
  margin-right: 0.5rem;
}

.negative-icon {
  color: #fa5252;
  font-style: normal;
  margin-right: 0.5rem;
}

.sides-list {
  margin: 0.5rem 0 0;
  padding-left: 2rem;
}

.sides-list li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
  color: #495057;
}

.positive li {
  position: relative;
}

.negative li {
  position: relative;
}

@media (max-width: 768px) {
  .analysis-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .rating-badge {
    margin-top: 0.5rem;
  }
}
</style>