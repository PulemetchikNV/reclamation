<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from 'primevue';
import {TOGGLE_SIDEBAR_KEY} from '../__data__/injectKeys.ts'
import { inject } from 'vue';
import { isAuthorized } from '../__data__/store';

defineOptions({
    name: "Header"
})

const router = useRouter()

function handleLogoClick() {
    router.push('/')
}
const toggleSidebar = inject(TOGGLE_SIDEBAR_KEY)
</script>

<template>
    <div class="ui-header">
        <Button
            v-if="isAuthorized"
            icon="pi pi-bars"
            rounded
            text
            severity="secondary"
            class="header-burger"
            @click="toggleSidebar"
        />
        <img 
            src="../assets/the-one-logo.svg" 
            alt="logo" 
            class="logo" 
            @click="handleLogoClick"
        />
    </div>
</template>

<style scoped>
.ui-header {
    display: flex;
    align-items: center;
    padding: 10px;
    background: white;
    border-bottom: 3px solid #2757FC;
}

.logo {
    width: 120px;
    height: 50px;
    margin-left: 10px; 

    cursor: pointer;
    transition: filter 0.3s ease;
}

.logo:hover {
    filter: brightness(80%)
}

</style>