<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/sessionStore'

const router = useRouter()
const sessionStore = useSessionStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const login = async () => {
    loading.value = true
    error.value = ''
    try {
        await sessionStore.adminLogin(username.value, password.value)
        router.push('/admin')
    } catch (err) {
        error.value = err.response?.data?.message || 'Login failed. Check your credentials.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="admin-login">
    <h1>Admin Access</h1>
    <form @submit.prevent="login">
        <div class="field">
            <label>Username</label>
            <input v-model="username" required />
        </div>
        <div class="field">
            <label>Password</label>
            <input v-model="password" type="password" required />
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <button type="submit" :disabled="loading">
            {{ loading ? 'Authenticating...' : 'Login' }}
        </button>
    </form>
  </div>
</template>

<style scoped>
.admin-login {
    padding: 3rem;
    max-width: 450px;
    margin: 4rem auto;
    background: var(--color-surface);
    border: var(--border-thickness) solid var(--color-red);
    box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-blood);
    border-radius: var(--radius-md);
    position: relative;
}

.admin-login::before {
    content: 'SECURITY_CHECK';
    position: absolute;
    top: 10px;
    right: 10px;
    background: var(--color-red);
    color: #fff;
    font-family: var(--font-ui);
    font-size: 0.6rem;
    padding: 2px 6px;
    border-radius: 4px;
}

h1 {
    font-family: var(--font-display);
    color: var(--color-red);
    text-shadow: 0 0 10px rgba(230, 62, 68, 0.4);
    margin-bottom: 2.5rem;
    text-align: center;
    font-size: 2.2rem;
}

.field {
    margin-bottom: 2rem;
}

label {
    display: block;
    margin-bottom: 0.8rem;
    color: var(--color-teal);
    font-family: var(--font-ui);
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: bold;
    letter-spacing: 1.5px;
}

.error {
    color: #fff;
    background: var(--color-blood);
    padding: 1rem;
    border: 1px solid var(--color-red);
    border-radius: var(--radius-sm);
    margin-bottom: 2rem;
    font-family: var(--font-ui);
    font-size: 0.8rem;
    text-align: center;
}
</style>
