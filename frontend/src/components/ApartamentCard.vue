<template>
  <Card>
    <template #content>
        <slot name="prepend" />
        <div
            
            class="apartment-card__image-container"
        >
          
        </div>
        <div class="apartment-card__content text-start">
            <VueMarkdown :source="apartment.description" />
        </div>
        <slot name="append" />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { Apartment } from '../types/apartament';
import { API_URL_KEY } from '../__data__/injectKeys';
import Card from 'primevue/card';
import Image from 'primevue/image';
import Chip from 'primevue/chip';
import VueMarkdown from 'vue-markdown-render';
import { getStaticUrl } from '../utils';
defineOptions({
  name: 'ApartmentCard'
});

const props = defineProps<{
  apartment: Apartment
}>();

const emit = defineEmits<{
  'select': [Apartment]
  'details': [Apartment]
}>();

const shortDescription = computed(() => {
  return props.apartment.description.length > 240
    ? `${props.apartment.description.substring(0, 240)}...`
    : props.apartment.description;
});

const sources = computed(() => {
  return []
});

const apiUrl = inject(API_URL_KEY)?.replace(/\/$/, '');

</script>

<style scoped>
.apartment-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 20px;
}

.apartment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.apartment-card__image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.apartment-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.apartment-card:hover .apartment-card__image {
  transform: scale(1.05);
}

.apartment-card__no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  color: #90a4ae;
  font-size: 3rem;
}

.apartment-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
}

.apartment-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.apartment-card__content {
  padding: 15px;
  overflow-y: auto;
}

.apartment-card__description {
  color: #5c5c5c;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 15px;
}

.apartment-card__actions {
  display: flex;
  justify-content: space-between;
}

.apartment-card__button {
  flex: 1;
  margin: 0 5px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background-color: #4267B2;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.apartment-card__button:first-child {
  margin-left: 0;
}

.apartment-card__button:last-child {
  margin-right: 0;
}

.apartment-card__button:hover {
  background-color: #365899;
}

.apartment-card__button--secondary {
  background-color: #f0f2f5;
  color: #4267B2;
}

.apartment-card__button--secondary:hover {
  background-color: #e4e6eb;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
}

@media (max-width: 768px) {
  .apartment-card {
    max-width: 100%;
  }
  .apartment-card__content {
    padding: 0px;
  }
}
</style>
