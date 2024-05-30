import { MessageContext, Middleware } from 'puregram';
import { ISession } from '../../interfaces';
import { prisma } from '../../instances';
import { SHARED_KEYS } from '../../constants';
import { getLanguageString } from '../../helpers';

export const getSharedList: Middleware<ISession & MessageContext> = async (context, next) => {
    if (context.session.commandName !== 'start' || context.session.args.length <= 0)
        return await next();

    const user = context.session.user;
    const key = context.session.args.join().split('_')[1];
    const info = SHARED_KEYS[key];

    if (!info)
        return await context.send(getLanguageString(user.language, 'unidentified-error')!);

    const list = await prisma.list.findUnique({
        where: { id: info.listId },
        include: { accessUsers: true }
    });

    if (!list || list.isMain)
        return await context.send(getLanguageString(user.language, 'unidentified-error')!);

    if (list.authorId === user.id)
        return await context.send(getLanguageString(user.language, 'you-already-on-list')!);

    for (const value of list.accessUsers) {
        if (value.userId === user.id)
            return await context.send(getLanguageString(user.language, 'you-already-on-list')!);
    }

    await prisma.userAccessList.create({
        data: { listId: info.listId, userId: user.id },
        include: { user: true, list: true }
    });

    return await context.send(getLanguageString(user.language, 'success-join-list')!);
};