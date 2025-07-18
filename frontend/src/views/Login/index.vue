<template>
    <div class="login-page">
        <Panel header="Авторизация">
            <form class="login-form" @submit.prevent="handleLogin">
                <InputText v-model="loginData.email" placeholder="Почта" />
                <Password v-model="loginData.password" fluid placeholder="Пароль" />
                <Message v-if="isLoginError" severity="error" :closable="false">
                    {{ isLoginError }}
                </Message>
                <Button :loading="isLoginLoading" type="submit">Войти</Button>
            </form>
            <p>Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../../composables/useAuth'
import { InputText, Password, Button } from 'primevue';
import {Panel, Message} from 'primevue';
import { useRouter } from 'vue-router';

const { login, isLoginLoading, isLoginError } = useAuth()

const loginData = ref({
    email: '',
    password: ''
})
const router = useRouter()

const handleLogin = async () => {
    await login(loginData.value)
    router.push('/scenario-groups')
}
</script>

<style scoped>
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 400px;
}

@media (max-width: 480px) {
    .login-page {
        padding: 0px;
        display: flex;
        align-items: stretch;
        flex-direction: column;
    }
    .login-form {
        width: 100%;
    }
}
</style>