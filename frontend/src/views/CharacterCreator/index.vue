<template>
  <div class="character-creator">
    <div class="header">
      <h1 class="title">{{ pageTitle }}</h1>
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
            <div class="p-field">
                <label for="characterPhoto">Фото персонажа</label>
                <FileUpload 
                    name="characterPhoto" 
                    @select="onPhotoSelect" 
                    :show-upload-button="false" 
                    :show-cancel-button="false"
                    accept="image/*" 
                    :maxFileSize="5000000"
                >
                    <template #header="{ chooseCallback, clearCallback, files }">
                        <div class="file-header">
                            <Button icon="pi pi-images" label="Выбрать" @click="chooseCallback" />
                            <Button @click="() => { clearCallback(); removePhoto(); }" icon="pi pi-times" label="Удалить" class="p-button-danger" :disabled="!characterPhoto && !photoUrl" />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="photoUrl || characterPhoto" class="preview-container">
                            <img :src="photoPreviewUrl" alt="Превью" class="image-preview" />
                        </div>
                        <div v-else class="empty-content">
                            <i class="pi pi-upload" />
                            <p>Перетащите изображение сюда для загрузки.</p>
                        </div>
                    </template>
                </FileUpload>
            </div>
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
            <div class="p-field">
                <label for="contextFile">Файл контекста (txt)</label>
                 <FileUpload 
                    name="contextFile"
                    @select="onFileSelect" 
                    :show-upload-button="false" 
                    :show-cancel-button="false"
                    accept=".txt" 
                    :maxFileSize="5000000"
                >
                    <template #header="{ chooseCallback, clearCallback, files }">
                        <div class="file-header">
                            <Button @click="chooseCallback" icon="pi pi-file" label="Выбрать" />
                            <Button @click="() => { clearCallback(); removeContextFile(); }" icon="pi pi-times" label="Удалить" class="p-button-danger" :disabled="!contextFile && !contextFileUrl" />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="contextFileUrl || contextFile" class="preview-container file-preview">
                            <i class="pi pi-file-export" style="font-size: 2rem;"></i>
                            <span>{{ contextFile?.name || getFileNameFromUrl(contextFileUrl) }}</span>
                        </div>
                        <div v-else class="empty-content">
                            <i class="pi pi-upload" />
                            <p>Перетащите .txt файл сюда для загрузки.</p>
                        </div>
                    </template>
                </FileUpload>
            </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useCounterparty } from '../../composables/useCounterparty';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
import { API_URL_KEY } from '../../__data__/injectKeys';
import { getStaticUrl } from '../../utils';

const props = defineProps({
  id: {
    type: String,
    default: null
  }
});

const router = useRouter();
const { 
  createCounterparty, 
  updateCounterparty, 
  getCounterparty, 
  currentCounterparty,
  isCounterpartiesLoading 
} = useCounterparty();

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

const contextFile = ref<File | null>(null);
const characterPhoto = ref<File | null>(null);
const photoUrl = ref<string | null>(null);
const contextFileUrl = ref<string | null>(null);

const removePhotoFlag = ref(false);
const removeContextFileFlag = ref(false);

const apiUrl = inject(API_URL_KEY);
const staticUrl = getStaticUrl(apiUrl as string);

const isEditMode = computed(() => !!props.id);
const pageTitle = computed(() => isEditMode.value ? 'Редактирование персонажа' : 'Создание персонажа');
const saveButtonLabel = computed(() => isEditMode.value ? 'Обновить' : 'Сохранить');

const photoPreviewUrl = computed(() => {
    if (characterPhoto.value) {
        return URL.createObjectURL(characterPhoto.value);
    }
    if (photoUrl.value) {
        return `${staticUrl}${photoUrl.value}`;
    }
    return '';
});

watch(currentCounterparty, (newVal) => {
  if (newVal && isEditMode.value) {
    // Глубокое копирование, чтобы избежать прямого изменения store
    const data = JSON.parse(JSON.stringify(newVal.characterData));
    form.value = {
        general: data.general || form.value.general,
        behavior: data.behavior || form.value.behavior,
        style: data.style || form.value.style,
        scenarios: data.scenarios || form.value.scenarios,
        visual: data.visual || form.value.visual,
        technical: data.technical || form.value.technical,
        restrictions: data.restrictions || form.value.restrictions,
        additional: data.additional || form.value.additional,
    };
     if (newVal.name) {
      form.value.general.name = newVal.name;
    }
    photoUrl.value = newVal.photos?.[0] || null;
    contextFileUrl.value = newVal.contextFilePath || null;
  }
});

onMounted(() => {
  if (isEditMode.value) {
    getCounterparty(props.id);
  }
});


const onFileSelect = (event: FileUploadSelectEvent) => {
  if (event.files && event.files.length > 0) {
    contextFile.value = event.files[0];
    contextFileUrl.value = null; 
    removeContextFileFlag.value = false;
  }
};

const onPhotoSelect = (event: FileUploadSelectEvent) => {
  if (event.files && event.files.length > 0) {
    characterPhoto.value = event.files[0];
    photoUrl.value = null;
    removePhotoFlag.value = false;
  }
};

const removePhoto = () => {
    characterPhoto.value = null;
    photoUrl.value = null;
    removePhotoFlag.value = true;
};

const removeContextFile = () => {
    contextFile.value = null;
    contextFileUrl.value = null;
    removeContextFileFlag.value = true;
};

const getFileNameFromUrl = (url: string | null) => {
    if (!url) return '';
    return url.split('/').pop() || '';
};

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
  const formData = new FormData();
  formData.append('name', form.value.general.name);
  formData.append('characterData', JSON.stringify({
    general: form.value.general,
    behavior: form.value.behavior,
    style: form.value.style,
    scenarios: form.value.scenarios,
    visual: form.value.visual,
    technical: form.value.technical,
    restrictions: form.value.restrictions,
    additional: form.value.additional,
  }));
  
  if (characterPhoto.value) {
    formData.append('characterPhoto', characterPhoto.value);
  } else if (removePhotoFlag.value) {
    formData.append('removePhoto', 'true');
  }

  if (contextFile.value) {
    formData.append('contextFile', contextFile.value);
  } else if (removeContextFileFlag.value) {
    formData.append('removeContextFile', 'true');
  }

  let success = false;
  if (isEditMode.value) {
    success = await updateCounterparty(props.id, formData);
  } else {
    success = await createCounterparty(formData);
  }

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
.file-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}
.preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 2px dashed #ccc;
    border-radius: 8px;
    margin-top: 1rem;
}
.image-preview {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
}
.file-preview {
    gap: 1rem;
    color: #6c757d;
}
.empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #6c757d;
}
.empty-content i {
    font-size: 2rem;
    margin-bottom: 1rem;
}
</style> 