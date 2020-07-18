import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

export default (routes: RouteConfig[]): VueRouter => {
  Vue.use(VueRouter);

  return new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
  });
};
