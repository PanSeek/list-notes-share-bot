import { TCallbackCommand } from '../types';
import { prisma } from '../instances';
import { getLanguageString } from '../helpers';

export const note: TCallbackCommand = async (context) => {
    const args = context.session.args;
    const user = context.session.user;
    if (args.length < 1)
        return await context.send(getLanguageString(user.language, 'miss-arguments')!);

    const list = await prisma.list.findFirst({
        where: {
            author: user,
            isMain: true
        }
    });

    if (!list)
        return await context.send(getLanguageString(user.language, 'not-found-main-list')!);

    const text = context.session.args.join(' ');

    await prisma.note.create({
        data: {
            author: { connect: { id: user.id } },
            content: text,
            list: { connect: { id: list.id } }
        }
    });
    return await context.reply(getLanguageString(user.language, 'new-note-in-list')!);
};