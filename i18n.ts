
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

export const locales = ["zh","en","es","fr","de","ja","ko"] as const;

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as (typeof locales)[number])) notFound();

  return {
    messages: (await import(`./message/${locale}.json`)).default,
  };
});
