// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'url';

export default defineNuxtConfig({
  devtools: { enabled: true },

  // Global CSS configuration
  css: [
    "~/assets/style/main.scss",
    "primevue/resources/themes/aura-light-green/theme.css",
    "/node_modules/primeflex/primeflex.css",
    "/node_modules/primeicons/primeicons.css",
  ],

  // Vite configuration for SCSS and relative alias
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/style/global.scss" as *;',
        },
      },
    },
    resolve: {
      alias: {
        "@layouts": fileURLToPath(new URL("./layouts", import.meta.url)),
      },
    },
  },

  // Nuxt modules configuration
  modules: ["nuxt-primevue"],

  // PrimeVue configuration
  primevue: {},

  // Auto-import configuration for composables and types
  imports: {
    dirs: ["types/*.ts", "types/**/*.ts", "layouts/composables/**"],
  },
});
