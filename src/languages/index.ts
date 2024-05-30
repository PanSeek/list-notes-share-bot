import { FluentBundle, FluentResource } from '@fluent/bundle';
import { join as pathJoin } from 'path';
import { readdirSync, readFileSync } from 'fs';

// Thx neverlane
const loadFluentBundles = <T extends FluentBundle, LocalesMap extends unknown, Langs extends string = string>(dir = 'languages') => {
    const langs: Map<Langs, T> = new Map();
    const path = pathJoin('src', dir);
    for (const fileName of readdirSync(path)) {
        if (!fileName.endsWith('.ftl'))
            continue;

        const lang = fileName.slice(0, -4);
        if (lang === 'icon')
            continue;

        const bundle = new FluentBundle(lang) as T;
        const file = readFileSync(pathJoin(path, fileName));

        bundle.addResource(new FluentResource(`
icon-flag-ru = 🇷🇺
icon-flag-en = 🇬🇧
icon-attention = ⚠️
icon-writing = 📝
icon-pin = 📌
icon-notification = 💡
icon-success = ✅`
        ));
        bundle.addResource(
            new FluentResource(file.toString())
        );
        langs.set(lang as Langs, bundle);
    }
    return <Key extends keyof LocalesMap>(lang: Langs, key: Key, format?: LocalesMap[Key] extends never ? null : LocalesMap[Key]) => {
        const bundle = langs.get(lang.toLowerCase() as Langs);
        if (!bundle) throw new Error('Lang not exists');
        const message = bundle.getMessage(key as string);
        if (!message || !message.value) return undefined;
        return bundle.formatPattern(message.value, format ?? undefined);
    };
};

export * from './types';
export { loadFluentBundles };