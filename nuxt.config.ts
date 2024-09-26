// nuxt.config.js
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  css: ["@/assets/global.css"],

  devServer: {
    port: 8000,
  },

  modules: ["@nuxt/image", "@nuxt/content", "@nuxt/icon", "@nuxt/ui"],
  runtimeConfig: {
    multer: {
      dest: "/tmp/", // Directory for file uploads
    },
  },

  icon: {
    provider: "iconify",
  },
});
