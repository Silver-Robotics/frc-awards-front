import { configure, defineRule } from "vee-validate";
import { required, email, min, max } from "@vee-validate/rules";
import { localize, setLocale } from "@vee-validate/i18n";
import ptBR from "@vee-validate/i18n/dist/locale/pt_BR.json";
import en from "@vee-validate/i18n/dist/locale/en.json";
import es from "@vee-validate/i18n/dist/locale/es.json";

defineRule("required", required);
defineRule("email", email);
defineRule("min", min);
defineRule("max", max);

configure({
  generateMessage: localize({ pt_BR: ptBR, en, es }),
  validateOnInput: true,
});

// Sync vee-validate locale with the app locale.
// Call this whenever the app locale changes (see App.vue).
export function syncVeeValidateLocale(locale) {
  const map = { pt: "pt_BR", en: "en", es: "es" };
  setLocale(map[locale] ?? "pt_BR");
}

// Apply the locale stored from a previous session on startup.
const savedLocale = localStorage.getItem("locale") || "pt";
syncVeeValidateLocale(savedLocale);
