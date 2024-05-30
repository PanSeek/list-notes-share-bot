import { IScene, ISession } from '../interfaces';
import { Context, Middleware } from 'puregram';
import { prisma } from '../instances';
import { ttl } from '@puregram/session';
import { TIME_LIFE_SESSION } from '../constants';

export const findUser: Middleware<ISession & IScene & Context> = async (context, next) => {
    if (context.session.user)
        return await next();

    if (!(context.is('message') || context.is('callback_query')))
        return;

    const findUser = await prisma.user.findUnique({ where: { telegramId: context.senderId } });
    if (!findUser)
        return await context.scene.enter('signup');

    context.session.user = ttl(findUser, TIME_LIFE_SESSION);
    return await next();
};