import { ILanguageStringType, IScene, ISession } from './interfaces';
import { MessageContext } from 'puregram';
import { CallbackDataBuilder } from '@puregram/callback-data';

export type TLanguage = keyof ILanguageStringType;
export type TCallbackCommand = (ctx: MessageContext & ISession & IScene) => Promise<void | MessageContext>;
export type GetCallbackDataPayload<T> = T extends CallbackDataBuilder<infer B> ? B : never;