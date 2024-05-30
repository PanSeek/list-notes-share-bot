import { MessageContext, Middleware } from 'puregram';
import { IScene, ISession } from '../../interfaces';
import { ttl } from '@puregram/session';
import { TIME_LIFE_SESSION } from '../../constants';

export const runCommand: Middleware<ISession & MessageContext & IScene> = async (context, next) => {
    if (!context.session.commandName)
        return await next();

    context.session.commandName = ttl('', TIME_LIFE_SESSION);
    return await context.session.command.callback(context);
};