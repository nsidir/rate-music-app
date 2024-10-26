<<<<<<< HEAD
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router.ts';
import './style.css'; // Import global styles
// Create and mount the Vue app
createApp(App)
  .use(router) // Register the router
  .mount('#app');
=======
import { createApp } from 'vue'
import './style.css'
import './assets/tailwind.css'; // Import Tailwind CSS here
import App from './App.vue'

createApp(App).mount('#app')
>>>>>>> origin/main
