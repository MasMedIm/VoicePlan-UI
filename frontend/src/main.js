import { createApp } from "vue";
import App from "./App.vue";
import "flowbite/dist/flowbite.css";
import "flowbite";

import installIcons from "./plugins/lucide.js";

const app = createApp(App);
installIcons(app);
app.mount("#app");
