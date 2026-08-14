import { type Locale } from "@/lib/config";

export type StrictTranslations<T extends Record<Locale, any>> = T extends { en: infer U }
  ? Record<Locale, U>
  : T;

export function localize<T extends Record<Locale, any>>(translations: T, locale: Locale) {
  const dict = translations[locale];

  if (!dict) {
    throw new Error(`Invalid locale provided: "${locale}"`);
  }

  return new Proxy(dict, {
    get(target, prop: string) {
      if (!(prop in target)) {
        throw new Error(`Missing translation key "${prop}" for locale "${locale}"`);
      }
      return target[prop as keyof typeof target];
    }
  });
}