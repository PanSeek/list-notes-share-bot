import { TCallbackCommand } from '../types';
import { getLists } from '../helpers';

export const list: TCallbackCommand = async (context) => {
    const result = await getLists(context.session.user);

    return await context.send(result.message, {
        reply_markup: {
            inline_keyboard: result.keyboard
        }
    });
};