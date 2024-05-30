import { TCallbackCommand } from '../types';
import { getLanguageString } from '../helpers';

export const quit: TCallbackCommand = async (context) => {
    await context.scene.leave();
    return await context.send(getLanguageString(context.session.user.language, 'success-cancel-action')!);
};