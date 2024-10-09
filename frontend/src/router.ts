// router.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Login from './components/Login.vue';
import Signup from './components/Signup.vue';
import Dashboard from './components/Dashboard.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!localStorage.getItem('token')) {
      next('/logdin');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
