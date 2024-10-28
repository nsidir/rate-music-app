// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router.ts';
import './style.css'; // Import global styles
// Create and mount the Vue app
createApp(App)
  .use(router) // Register the router
  .mount('#app');
