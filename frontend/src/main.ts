import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(router).use(pinia)

// Check for token expiration before mounting the app
const userStore = useUserStore();
const isAuth = await userStore.checkAuth();

console.log('Is user authenticated:', isAuth);

app.mount('#app')

userStore.initialize().catch(console.error)