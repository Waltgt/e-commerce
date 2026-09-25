import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./router";
import App from "./App.vue";
import { useAuthStore } from "./stores/auth";
import "./assets/styles/base.css";

const app = createApp(App);
app.use(createPinia());

const authStore = useAuthStore();
authStore.tryRestoreSession().finally(() => {
  app.use(router);
  app.mount("#app");
});