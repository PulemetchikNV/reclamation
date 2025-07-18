<template>
    <Button text @click="logout">Выйти</Button>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth';
import { Button } from 'primevue';
const { logout } = useAuth()
</script>