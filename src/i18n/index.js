import { createI18n } from "vue-i18n";
import pt from "./locales/pt.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

const savedLocale = localStorage.getItem("locale") || "pt";

export const i18n = createI18n({
  legacy: false,          // Composition API mode — required for useI18n() in <script setup>
  locale: savedLocale,
  fallbackLocale: "pt",
  messages: { pt, en, es },
});
