import { TCallbackCommand } from '../types';
import { prisma } from '../instances';
import { getLanguageString } from '../helpers';

export const language: TCallbackCommand = async (context) => {
    const user = await prisma.user.update({
        where: { telegramId: context.senderId! },
        data: { language: context.session.user.language === 'EN' ? 'RU' : 'EN' }
    });
    context.session.user = user;

    return await context.send(getLanguageString(user.language, 'language-change-on', { language: user.language === 'RU' ? 'Русский' : 'English' })!);
};