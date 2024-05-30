import { Language } from '@prisma/client';
import { loadFluentBundles, LocalesMap, TypedFluentBundle } from '../languages';

const getLanguageString = loadFluentBundles<TypedFluentBundle, LocalesMap, 'ru' | 'en' | Language>();

export { getLanguageString };