import { MINUTE_LIFE_SHARED_KEY, URL_GITHUB_REPOSITORY } from './constants';
import { generateShareKey, getLanguageString, getLists, getNotes, print } from './helpers';
import { bot, prisma } from './instances';
import { sceneManager } from './scenes';
import { session } from '@puregram/session';
import { ActionListPayload, ActionNotePayload, ListPayload } from './buttons';
import { ParseMode } from 'puregram';
import { TypeActionList, TypeActionNote, TypeList } from './enums';
import {
    filterIncomingMessage,
    findUser,
    getArgumentsAndCommand, getSharedList,
    runCommand,
    runCommandQuit
} from './middlewares';
import * as register from './registers';
import { Commands } from './classes/commands';
import { User } from '@prisma/client';

bot.onBeforeRequest((context) => {
    if (context.path === 'sendMessage' || context.path === 'editMessageText')
        context.params.parse_mode = ParseMode.HTML;
    return context;
});

bot.updates.use(session());
bot.updates.use(sceneManager.middleware);
bot.updates.on('message', filterIncomingMessage);
bot.updates.use(findUser);
bot.updates.on('message', getArgumentsAndCommand);
bot.updates.on('message', runCommandQuit);
bot.updates.on('message', getSharedList);
bot.updates.use(sceneManager.middlewareIntercept);
bot.updates.on('message', runCommand);
// bot.updates.on('message', middlewaresMessage.menu);

bot.updates.use(ListPayload.handle(async (context) => {
    const payload = context.unpackedPayload;
    const user = context.session.user as User;

    if (payload.expiresAt - Date.now() < 0)
        return await context.editText(getLanguageString(user.language, 'expired-minutes')!);

    const notes = await getNotes(user, payload.listId);
    if (!notes)
        return await context.message!.send(getLanguageString(user.language, 'unidentified-error')!);

    await context.editText(notes.message, {
        reply_markup: notes.keyboard
    });
}));

bot.updates.use(ActionListPayload.handle(async (context) => {
    const payload = context.unpackedPayload;
    const user = context.session.user as User;

    if (payload.expiresAt - Date.now() < 0)
        return await context.editText(getLanguageString(user.language, 'expired-minutes')!);

    if (payload.action === TypeActionList.REFRESH) {
        const lists = await getLists(user);
        return await context.editText(lists.message, {
            reply_markup: {
                inline_keyboard: lists.keyboard
            }
        });
    }

    if (payload.action === TypeActionList.ADD) {
        // @ts-ignore
        return await context.scene.enter('listAction', { state: payload });
    }

    if (payload.action === TypeActionList.LEAVE) {
        if (payload.type === TypeList.MAIN)
            return await context.message!.send(getLanguageString(user.language, 'cannot-leave-main-list')!);

        const deleted = await prisma.userAccessList.deleteMany({ where: { userId: user.id, listId: payload.listId } });

        if (deleted.count === 0)
            await context.message!.send(getLanguageString(user.language, 'failed-leave-list')!);
        else
            await context.message!.send(getLanguageString(user.language, 'success-leave-list')!);

        const lists = await getLists(user);
        return await context.editText(lists.message, {
            reply_markup: {
                inline_keyboard: lists.keyboard
            }
        });
    }

    const list = await prisma.list.findUnique({
        where: { id: payload.listId },
        include: { accessUsers: true }
    });
    if (!list) {
        await context.message!.send(getLanguageString(user.language, 'not-found-list')!);
        const lists = await getLists(user);
        return await context.editText(lists.message, {
            reply_markup: {
                inline_keyboard: lists.keyboard
            }
        });
    }

    if (list.authorId !== user.id) {
        const accessFind = list.accessUsers.find((value) => value.userId === user.id);
        if (!accessFind)
            return await context.message!.send(getLanguageString(user.language, 'not-found-list')!);
    }

    if (payload.action === TypeActionList.SHARE) {
        await context.answerCallbackQuery();

        if (list.isMain)
            return await context.message!.send(getLanguageString(user.language, 'cannot-share-main-list')!);

        if (list.authorId !== user.id)
            return await context.message!.send(getLanguageString(user.language, 'not-author-list')!);

        const key = generateShareKey({ authorId: user.id, listId: list.id, expiresAtMinutes: MINUTE_LIFE_SHARED_KEY });
        return await context.message!.send(getLanguageString(user.language,  'explanation-share-list', { minutes: MINUTE_LIFE_SHARED_KEY })! + `\n\nt.me/${ bot.bot.username }?start=slist_${ key }`);
    }

    if (payload.action === TypeActionList.DELETE) {
        if (payload.type === undefined)
            return await context.message!.send(getLanguageString(user.language, 'unidentified-error')!);

        if (payload.type === TypeList.MAIN)
            return await context.message!.send(getLanguageString(user.language, 'cannot-delete-main-list')!);

        if (payload.type === TypeList.SHARED && list.authorId !== user.id)
            return await context.message!.send(getLanguageString(user.language, 'not-author-list')!);

        const deletedList = await prisma.list.delete({ where: { id: payload.listId, authorId: user.id } });
        await context.message!.send(getLanguageString(user.language, 'success-deleted-list', { name: deletedList.name })!);

        const lists = await getLists(user);
        return await context.editText(lists.message, {
            reply_markup: {
                inline_keyboard: lists.keyboard
            }
        });
    }

    if (payload.action === TypeActionList.KICK_USER) {
        if (list.authorId !== user.id)
            return await context.message!.send(getLanguageString(user.language, 'not-author-list')!);

        const users: Pick<User, 'id' | 'name'>[] = [];
        const userAccessList = await prisma.userAccessList.findMany({
            where: { listId: payload.listId },
            include: { user: true }
        });
        userAccessList.forEach((value) => {
            users.push({ id: value.user.id, name: value.user.name });
        });

        if (users.length <= 0)
            return await context.message!.send(getLanguageString(user.language, 'not-found-users-list')!);

        // @ts-ignore
        return await context.scene.enter('kickUser', { state: { ...payload, list, users } });
    }

    // @ts-ignore
    return await context.scene.enter('listAction', { state: { ...payload, list } });
}));

bot.updates.use(ActionNotePayload.handle(async (context) => {
    const payload = context.unpackedPayload;
    const user = context.session.user as User;

    if (payload.expiresAt - Date.now() < 0)
        return await context.editText(getLanguageString(user.language, 'expired-minutes')!);

    const notes = await getNotes(user, payload.listId);
    if (!notes) {
        await context.message!.send(getLanguageString(user.language, 'not-found-list')!);
        const lists = await getLists(user);
        return await context.editText(lists.message, {
            reply_markup: {
                inline_keyboard: lists.keyboard
            }
        });
    }

    if (payload.action === TypeActionNote.REFRESH)
        return await context.editText(notes.message, {
            reply_markup: notes.keyboard
        });

    // @ts-ignore
    return await context.scene.enter('noteAction', { state: { ...payload, notesId: notes.messagesId } });
}));

const start = async () => {
    // Connect Database
    await prisma.$connect();
    print('Database', 'Prisma connected');

    // Register commands bot
    register.commands();
    print('Commands', `Register commands. Count commands: ${ Commands.count }`);

    // Set description bot
    await bot.api.setMyShortDescription({
        short_description: `Author: @PanSeek\nGitHub Repository: ${ URL_GITHUB_REPOSITORY }`
    });
    print('Telegram', 'Set description');

    // Set commands bot
    await bot.api.setMyCommands({
        commands: Commands.generateMyCommand()
    });
    print('Telegram', 'Set commands');

    // Start bot
    await bot.updates.startPolling({ dropPendingUpdates: true });
    print('Telegram', 'Bot is started');
};

start()
    .catch(async (e) => {
        print('Error started', e);

        await prisma.$disconnect();
        print('Database', 'Prisma disconnected');

        bot.updates.stopPolling();
        print('Telegram', 'Bot is stopped');
    });