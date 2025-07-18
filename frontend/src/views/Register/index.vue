<template>
    <div class="register-page">
        <Panel header="Регистрация">
            <form class="register-form" @submit.prevent="handleRegister">
                <InputText v-model="registerData.email" placeholder="Email" />
                <InputText v-model="registerData.firstName" placeholder="Имя" />
                <InputText v-model="registerData.lastName" placeholder="Фамилия" />
                <Password v-model="registerData.password" fluid placeholder="Пароль" />
                <Message v-if="isRegisterError" severity="error" :closable="false">
                    {{ isRegisterError }}
                </Message>
                <Button :loading="isRegisterLoading" type="submit">Зарегистрироваться</Button>
            </form>
            <p>Уже есть в системе? <router-link to="/login">Войти</router-link></p>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../../composables/useAuth'
import { InputText, Password, Button } from 'primevue';
import {Panel, Message}  from 'primevue';
import { addMessage } from '../../__data__/store';
import { useRouter } from 'vue-router';
const { register, isRegisterLoading, isRegisterError } = useAuth()

const registerData = ref({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
})

const router = useRouter()

const handleRegister = async () => {
    await register(registerData.value)
    addMessage({
        severity: 'success',
        summary: 'Успешная регистрация',
        detail: 'Теперь вы можете войти в систему'
    })
    router.push('/login')
}
</script>

<style scoped>
.register-page {
    display: flex;
    justify-content: center;
    align-items: center;
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 400px;
}
@media (max-width: 480px) {
    .register-page {
        padding: 0px;
        display: flex;
        align-items: stretch;
        flex-direction: column;
    }
    .register-form {
        width: 100%;
    }
}
</style>