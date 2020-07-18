import { Route, RouteConfig } from 'vue-router';
import Home from '@/components/Home.vue';

export const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    props: (route: Route): { existingRoomId: string | null } => ({
      existingRoomId: route.query.room ? String(route.query.room) : null,
    }),
  },
];
