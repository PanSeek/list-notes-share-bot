import { ISession } from '../../interfaces';
import { MessageContext, Middleware } from 'puregram';
import { ttl } from '@puregram/session';
import { TIME_LIFE_SESSION } from '../../constants';
import { Commands } from '../../classes/commands';

export const getArgumentsAndCommand: Middleware<ISession & MessageContext> = async (context, next) => {
    const isCommand = context.text!.slice(0, 1) === '/';
    const args = context.text!.split(/\s+/);
    if (isCommand)
        args.shift();

    context.session.args = ttl(args, TIME_LIFE_SESSION);

    if (!isCommand) {
        context.session.commandName = ttl('', TIME_LIFE_SESSION);
        return await next();
    }

    let commandName = context.text!.split(/\s+/)[0];
    if (!commandName || !/^\//.test(commandName)) {
        context.session.commandName = ttl('', TIME_LIFE_SESSION);
        return await next();
    }

    commandName = commandName.split('/')[1];
    if (!commandName) {
        context.session.commandName = ttl('', TIME_LIFE_SESSION);
        return await next();
    }

    const command = Commands.list[commandName];
    if (!command) {
        context.session.commandName = ttl('', TIME_LIFE_SESSION);
        return await next();
    }

    context.session.command = ttl(command, TIME_LIFE_SESSION);
    context.session.commandName = ttl(commandName, TIME_LIFE_SESSION);

    await next();
};