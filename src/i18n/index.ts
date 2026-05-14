import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
    defaultLanguage,
    languageStorageKey,
    resources,
    supportedLanguages,
    type AppLanguage,
} from "@/i18n/resources";

function isAppLanguage(value: string | null | undefined): value is AppLanguage {
    return supportedLanguages.includes(value as AppLanguage);
}

function getInitialLanguage(): AppLanguage {
    if (typeof window === "undefined") {
        return defaultLanguage;
    }

    const storedLanguage = window.localStorage.getItem(languageStorageKey);
    return isAppLanguage(storedLanguage) ? storedLanguage : defaultLanguage;
}

void i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getInitialLanguage(),
        fallbackLng: defaultLanguage,
        supportedLngs: supportedLanguages,
        interpolation: {
            escapeValue: false,
        },
        returnNull: false,
    });

i18n.on("languageChanged", (language) => {
    if (typeof window === "undefined" || !isAppLanguage(language)) {
        return;
    }

    window.localStorage.setItem(languageStorageKey, language);
});

export { i18n, isAppLanguage };
