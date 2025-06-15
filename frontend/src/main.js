import { createApp } from "vue";
import App from "./App.vue";

import installIcons from "./plugins/lucide.js";

const app = createApp(App);
installIcons(app);
app.mount("#app");
