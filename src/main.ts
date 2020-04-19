import VueNativeSock from 'vue-native-websocket';
import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

Vue.use(VueNativeSock, 'ws://localhost:8081');

new Vue({render: h => h(App)}).$mount("#app");
