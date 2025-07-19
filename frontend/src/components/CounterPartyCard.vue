<template>
  <div :class="['character-card', `character-card--${size}`]">
    <div class="character-card__actions">
      <slot name="actions"></slot>
    </div>
    <div class="character-card__image-wrapper" @click="emit('click')">
      <img 
        :src="imageUrl" 
        :alt="counterparty.name" 
        class="character-card__image"
      />
    </div>
    <div class="character-card__content" @click="emit('click')">
      <h3 class="character-card__name">{{ counterparty.name }}</h3>
      <p v-if="size === 'large'" class="character-card__description">{{ counterparty.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { PropType } from 'vue';
import type { Counterparty } from '../types/counterparty';
import { API_URL_KEY } from '../__data__/injectKeys';
import { getFormattedUrl, getStaticUrl } from '../utils';

const props = defineProps({
  counterparty: {
    type: Object as PropType<Counterparty>,
    required: true
  },
  size: {
    type: String as PropType<'small' | 'large'>,
    default: 'large'
  }
});

const emit = defineEmits(['click']);

const apiUrl = inject(API_URL_KEY);
const publicUrl = getStaticUrl(apiUrl as string);
const placeholderImage = `${publicUrl}/images/placeholders/400x400.svg`;

const imageUrl = computed(() => {
  const photo = props.counterparty.photos?.[0];
  return photo ? `${publicUrl}${photo}` : placeholderImage;
});

</script>

<style scoped>
.character-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.character-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.character-card__image-wrapper, .character-card__content {
    cursor: pointer;
}

.character-card__actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  display: flex;
  gap: 0.5rem;
}

.character-card__image-wrapper {
  position: relative;
  width: 100%;
}

.character-card--large .character-card__image-wrapper {
  padding-top: 75%; /* Aspect ratio 4:3 */
}

.character-card--small .character-card__image-wrapper {
  padding-top: 100%; /* Aspect ratio 1:1 */
}

.character-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character-card__content {
  padding: 1rem;
}

.character-card__name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-card__description {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.character-card--small .character-card__name {
  font-size: 1rem;
}
</style>