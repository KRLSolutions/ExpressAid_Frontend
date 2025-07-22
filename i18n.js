import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import hi from './locales/hi.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

const deviceLocale = Localization.locale || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLocale.split('-')[0], // e.g., 'en', 'hi'
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 