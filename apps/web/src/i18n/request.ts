import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

type Locale = (typeof routing.locales)[number];

function isLocale(value: string): value is Locale {
    return routing.locales.includes(value as Locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !isLocale(locale)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
