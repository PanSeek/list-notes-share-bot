import { TCallbackCommand } from '../types';
import { getLanguageString } from '../helpers';

export const start: TCallbackCommand = async (context) => {
    return await context.send(getLanguageString(context.session.user.language, 'about')!);
};