import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'
import './style.css' // We will use this for global styles

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Init Auth Store
const authStore = useAuthStore()
authStore.init().then(() => {
    app.mount('#app')
})
