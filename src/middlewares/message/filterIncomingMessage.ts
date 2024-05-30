import { MessageContext, Middleware } from 'puregram';

export const filterIncomingMessage: Middleware<MessageContext> = async (context, next) => {
    if (
        !context ||
        !context.is('message') ||
        !context.from ||
        context.from.isBot() ||
        !context.hasText() ||
        !context.senderId ||
        !context.isPM()
    )
        return;

    await next();
};
