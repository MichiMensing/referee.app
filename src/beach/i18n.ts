import en from "./translations/en.json";
import es from "./translations/es.json";
import de from "./translations/de.json";
import fr from "./translations/fr.json";

const i18n = {
  fallbackLng: {
    "de-CH": ["de"],
    "de-DE": ["de"],
    "en-AU": ["en"],
    "en-BE": ["en"],
    "en-GB": ["en"],
    "en-JP": ["en"],
    "en-US": ["en"],
    "fr-BE": ["fr"],
    "fr-CA": ["fr"],
    "fr-CH": ["fr"],
    "fr-FR": ["fr"],
    "es-ES": ["es"],
    default: ["en"],
  },
  debug: process.env.NODE_ENV !== "production",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en,
    es,
    de,
    fr,
  },
  supportedLngs: ["en", "es", "de", "fr"],
};

export default i18n;
