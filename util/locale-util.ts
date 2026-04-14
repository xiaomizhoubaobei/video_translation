import { locales } from "@/i18n";

/**
 * Detects the locale from a given string.
 *
 * @param {string} locale - The locale string to detect from.
 * @return {(typeof locales)[number]} The detected locale if it exists in the locales list, otherwise the first locale in the list.
 */
export const detectLocale = (locale: string): (typeof locales)[number] => {
  const detectedLocale = locale.split("-")[0];
  console.log("detectedLocale", detectedLocale)
  if (locales.includes(detectedLocale as (typeof locales)[number])) {
    return detectedLocale as (typeof locales)[number];
  }
  return locales[0];
};
