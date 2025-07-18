<template>
  <div class="character-creator">
    <div class="header">
      <h1 class="title">Конструктор персонажей</h1>
      <div class="actions">
        <Button icon="pi pi-clipboard" @click="pasteFromClipboard" severity="secondary" />
        <Button label="Сохранить" icon="pi pi-check" @click="saveCharacter" />
      </div>
    </div>
    <TabView>
      <TabPanel header="1. Общая информация" :value="0">
        <div class="form-section">
          <IftaLabel>
            <InputText id="name" v-model="form.general.name" fluid />
            <label for="name">Имя персонажа</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="role" v-model="form.general.role" fluid />
            <label for="role">Роль и назначение</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="format" v-model="form.general.format" fluid />
            <label for="format">Формат</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="audience" v-model="form.general.audience" fluid />
            <label for="audience">Целевая аудитория</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="language" v-model="form.general.language" fluid />
            <label for="language">Язык</label>
          </IftaLabel>
        </div>
      </TabPanel>
      <TabPanel header="2. Поведение и характер" :value="1">
        <div class="form-section">
          <IftaLabel>
            <InputText id="personalityType" v-model="form.behavior.personalityType" fluid />
            <label for="personalityType">Тип личности</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea id="keyTraits" v-model="form.behavior.keyTraits" rows="3" fluid />
            <label for="keyTraits">Ключевые черты характера</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="tone" v-model="form.behavior.tone" fluid />
            <label for="tone">Тон общения</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="proactivity" v-model="form.behavior.proactivity" fluid/>
            <label for="proactivity">Уровень инициативности</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="attitude" v-model="form.behavior.attitude" fluid/>
            <label for="attitude">Отношение к пользователю</label>
          </IftaLabel>
        </div>
      </TabPanel>
      <TabPanel header="3. Язык и стиль" :value="2">
        <div class="form-section">
          <IftaLabel>
            <InputText id="register" v-model="form.style.register" fluid />
            <label for="register">Регистрация</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="complexity" v-model="form.style.complexity" fluid/>
            <label for="complexity">Сложность языка</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="emojiUsage" v-model="form.style.emojiUsage" fluid/>
            <label for="emojiUsage">Использование эмодзи</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea id="emojiExamples" v-model="form.style.emojiExamples" rows="2" fluid/>
            <label for="emojiExamples">Примеры эмодзи</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="memeUsage" v-model="form.style.memeUsage" fluid />
            <label for="memeUsage">Использование мемов</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea id="memeExamples" v-model="form.style.memeExamples" rows="2" fluid />
            <label for="memeExamples">Примеры мемов/референсов</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="stickerUsage" v-model="form.style.stickerUsage" fluid />
            <label for="stickerUsage">Стикеры</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea id="phraseExamples" v-model="form.style.phraseExamples" rows="3" fluid />
            <label for="phraseExamples">Примеры типичных фраз</label>
          </IftaLabel>
        </div>
      </TabPanel>
      <TabPanel header="4. Сценарные функции" :value="3">
        <div class="form-section">
          <IftaLabel>
            <Textarea id="mainTasks" v-model="form.scenarios.mainTasks" rows="3" fluid />
            <label for="mainTasks">Основные задачи</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="contextMemory" v-model="form.scenarios.contextMemory" fluid />
            <label for="contextMemory">Контекстная память</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea id="scenarioExamples" v-model="form.scenarios.scenarioExamples" rows="3" fluid />
            <label for="scenarioExamples">Сценарии</label>
          </IftaLabel>
        </div>
      </TabPanel>
      <TabPanel header="5. Визуальный образ" :value="4">
        <div class="form-section">
          <IftaLabel>
            <InputText id="visualType" v-model="form.visual.visualType" fluid />
            <label for="visualType">Тип визуала</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="ageGender" v-model="form.visual.ageGender" fluid />
            <label for="ageGender">Возраст и гендер</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="clothingStyle" v-model="form.visual.clothingStyle" fluid />
            <label for="clothingStyle">Одежда / стиль</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="colorPalette" v-model="form.visual.colorPalette" fluid />
            <label for="colorPalette">Цветовая гамма</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="gestures" v-model="form.visual.gestures" fluid />
            <label for="gestures">Фирменные эмоции / жесты</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="avatar" v-model="form.visual.avatar" fluid />
            <label for="avatar">Аватар / стикерпак</label>
          </IftaLabel>
        </div>
      </TabPanel>
      <TabPanel header="6. Технические параметры" :value="5">
        <div class="form-section">
          <IftaLabel>
            <InputText id="integrations" v-model="form.technical.integrations" fluid />
            <label for="integrations">Интеграции</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="aiComponent" v-model="form.technical.aiComponent" fluid />
            <label for="aiComponent">Наличие AI-составляющей</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="buttonsMenu" v-model="form.technical.buttonsMenu" fluid/>
            <label for="buttonsMenu">Кнопки / меню</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="timeouts" v-model="form.technical.timeouts" fluid/>
            <label for="timeouts">Тайм-ауты и логика задержек</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="platforms" v-model="form.technical.platforms" fluid />
            <label for="platforms">Платформы</label>
          </IftaLabel>
        </div>
      </TabPanel>
      <TabPanel header="7. Ограничения и запреты" :value="6">
        <div class="form-section">
          <IftaLabel>
            <InputText id="contentFilter" v-model="form.restrictions.contentFilter" fluid />
            <label for="contentFilter">Контент-фильтр</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea id="forbiddenTopics" v-model="form.restrictions.forbiddenTopics" rows="2" fluid />
            <label for="forbiddenTopics">Темы под запретом</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea id="stopWords" v-model="form.restrictions.stopWords" rows="2" fluid/>
            <label for="stopWords">Стоп-слова или триггеры</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea id="behaviorRestrictions" v-model="form.restrictions.behaviorRestrictions" fluid rows="3" />
            <label for="behaviorRestrictions">Ограничения поведения</label>
          </IftaLabel>
        </div>
      </TabPanel>
      <TabPanel header="8. Дополнительно" :value="7">
        <div class="form-section">
          <IftaLabel>
            <InputText id="scalability" v-model="form.additional.scalability" fluid/>
            <label for="scalability">Возможность масштабирования</label>
          </IftaLabel>
          <IftaLabel>
            <InputText id="brandTone" v-model="form.additional.brandTone" fluid/>
            <label for="brandTone">Пожелания по тону бренда</label>
          </IftaLabel>
          <IftaLabel>
            <Textarea id="references" v-model="form.additional.references" rows="3" fluid />
            <label for="references">Аналоги и референсы</label>
          </IftaLabel>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCounterparty } from '../../composables/useCounterparty';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';

const router = useRouter();
const { createCounterparty, isCreating } = useCounterparty();

const form = ref({
  general: { name: '', role: '', format: '', audience: '', language: '' },
  behavior: { personalityType: '', keyTraits: '', tone: '', proactivity: '', attitude: '' },
  style: { register: '', complexity: '', emojiUsage: '', emojiExamples: '', memeUsage: '', memeExamples: '', stickerUsage: '', phraseExamples: '' },
  scenarios: { mainTasks: '', contextMemory: '', scenarioExamples: '' },
  visual: { visualType: '', ageGender: '', clothingStyle: '', colorPalette: '', gestures: '', avatar: '' },
  technical: { integrations: '', aiComponent: '', buttonsMenu: '', timeouts: '', platforms: '' },
  restrictions: { contentFilter: '', forbiddenTopics: '', stopWords: '', behaviorRestrictions: '' },
  additional: { scalability: '', brandTone: '', references: '' }
});

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      parseAndFillForm(text);
    }
  } catch (err) {
    console.error('Не удалось прочитать из буфера обмена:', err);
  }
};

const parseAndFillForm = (text: string) => {
  const lines = text.split(/\r?\n/).map(line => line.trim());

  const parseSection = (lines: string[], startMarker: string, parsers: { [key: string]: (value: string) => void }) => {
    let inSection = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(startMarker)) {
        inSection = true;
        continue;
      }
      if (line.startsWith('---') && inSection) {
        break;
      }

      if (inSection) {
        for (const key of Object.keys(parsers)) {
          if (line.includes(key + ':')) {
            const value = line.substring(line.indexOf(':') + 1).trim();
            parsers[key](value);
            break;
          }
        }
      }
    }
  };

  parseSection(lines, 'Общая информация', {
    'Имя персонажа': (value) => form.value.general.name = value,
    'Роль и назначение': (value) => form.value.general.role = value,
    'Формат': (value) => form.value.general.format = value,
    'ЦА': (value) => form.value.general.audience = value,
    'Язык': (value) => form.value.general.language = value,
  });

  parseSection(lines, 'Поведение и характер', {
    'Тип личности': (value) => form.value.behavior.personalityType = value,
    'Ключевые черты характера': (value) => form.value.behavior.keyTraits = value,
    'Тон общения': (value) => form.value.behavior.tone = value,
    'Уровень инициативности': (value) => form.value.behavior.proactivity = value,
    'Отношение к пользователю': (value) => form.value.behavior.attitude = value,
  });

  parseSection(lines, 'Язык и стиль общения', {
    'Регистрация': (value) => form.value.style.register = value,
    'Сложность языка': (value) => form.value.style.complexity = value,
    'Использует ли эмодзи': (value) => form.value.style.emojiUsage = value,
    'Примеры эмодзи': (value) => form.value.style.emojiExamples = value,
    'Использует ли мемы': (value) => form.value.style.memeUsage = value,
    'Примеры мемов/референсов': (value) => form.value.style.memeExamples = value,
    'Стикеры': (value) => form.value.style.stickerUsage = value,
    'Примеры типичных фраз': (value) => form.value.style.phraseExamples = value,
  });

  parseSection(lines, 'Сценарные функции', {
    'Основные задачи': (value) => form.value.scenarios.mainTasks = value,
    'Контекстная память': (value) => form.value.scenarios.contextMemory = value,
    'Сценарии': (value) => form.value.scenarios.scenarioExamples = value,
  });

  parseSection(lines, 'Визуальный образ', {
    'Тип визуала': (value) => form.value.visual.visualType = value,
    'Возраст и гендер': (value) => form.value.visual.ageGender = value,
    'Одежда / стиль': (value) => form.value.visual.clothingStyle = value,
    'Цветовая гамма': (value) => form.value.visual.colorPalette = value,
    'Фирменные эмоции / жесты': (value) => form.value.visual.gestures = value,
    'Аватар / стикерпак': (value) => form.value.visual.avatar = value,
  });

  parseSection(lines, 'Технические параметры', {
    'Интеграции': (value) => form.value.technical.integrations = value,
    'Наличие AI-составляющей': (value) => form.value.technical.aiComponent = value,
    'Кнопки / меню': (value) => form.value.technical.buttonsMenu = value,
    'Тайм-ауты и логика задержек': (value) => form.value.technical.timeouts = value,
    'Платформы': (value) => form.value.technical.platforms = value,
  });

  parseSection(lines, 'Ограничения и запреты', {
    'Контент-фильтр': (value) => form.value.restrictions.contentFilter = value,
    'Темы под запретом': (value) => form.value.restrictions.forbiddenTopics = value,
    'Стоп-слова или триггеры на модерацию': (value) => form.value.restrictions.stopWords = value,
    'Ограничения поведения': (value) => form.value.restrictions.behaviorRestrictions = value,
  });

  parseSection(lines, 'Дополнительно', {
    'Возможность масштабирования': (value) => form.value.additional.scalability = value,
    'Пожелания по тону бренда': (value) => form.value.additional.brandTone = value,
    'Аналоги и референсы': (value) => form.value.additional.references = value,
  });
};

const saveCharacter = async () => {
  const payload = {
    name: form.value.general.name,
    character: form.value.behavior.personalityType,
    goal: form.value.behavior.attitude,
    description: form.value.general.role,
    characterData: {
      general: form.value.general,
      behavior: form.value.behavior,
      style: form.value.style,
      scenarios: form.value.scenarios,
      visual: form.value.visual,
      technical: form.value.technical,
      restrictions: form.value.restrictions,
      additional: form.value.additional,
    },
    photos: [] // Placeholder
  };
  
  const success = await createCounterparty(payload);
  if (success) {
    router.push('/characters');
  }
};

</script>

<style scoped>
.character-creator {
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
.actions {
  display: flex;
  gap: 0.5rem;
}
.form-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1rem;
}
</style> 