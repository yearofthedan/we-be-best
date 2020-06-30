import Vue from 'vue';
import VueRouter, { RouteConfig, Route } from 'vue-router';
import Home from '@/components/Home.vue';

Vue.use(VueRouter);

export const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    props: (route: Route): { roomId: string | null } => ({
      roomId: String(route.query.room),
    }),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
