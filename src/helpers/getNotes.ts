import { prisma } from '../instances';
import { Language, User } from '@prisma/client';
import { TLanguage } from '../types';
import { getLanguageString } from './getLanguageString';
import { TypeActionList, TypeActionNote, TypeList } from '../enums';
import { ActionListPayload, ActionNotePayload } from '../buttons';
import { getFutureMinutes } from './getFutureMinutes';
import { LocalesMap } from '../languages';
import { InlineKeyboard } from '@gramio/keyboards';

const getStrType = (language: Language | TLanguage, type: TypeList) => {
    let t: keyof LocalesMap = 'explanation-main-list';
    if (type === TypeList.SHARED)
        t = 'explanation-shared-list';
    else if (type === TypeList.PRIVATE)
        t = 'explanation-private-list';
    return getLanguageString(language, t)!;
};

export const getNotes = async (user: User, listId: number) => {
    const list = await prisma.list.findUnique({
        where: { id: listId },
        include: {
            notes: { include: { author: true } },
            accessUsers: { where: { listId: listId } }
        }
    });

    if (!list)
        return null;

    if (list.authorId !== user.id) {
        const findAccess = list.accessUsers.find((value) => value.userId === user.id);
        if (!findAccess)
            return null;
    }

    const listType: TypeList = list.isMain ? TypeList.MAIN : ( list.accessUsers.length > 0 ? TypeList.SHARED : TypeList.PRIVATE );
    const textAuthorLang = getLanguageString(user.language, 'author')!;

    const messagesId: { [id: number]: number } = [ ];
    const messages: string[] = [ `> <b>${ list.name }</b> (${ getStrType(user.language, listType) })\n` ];
    if (!list.notes || list.notes.length <= 0)
        messages.push(getLanguageString(user.language, 'empty-notes')!);
    else
        list.notes.forEach((value, index) => {
            messagesId[index + 1] = value.id;
            if (listType === TypeList.SHARED)
                messages.push(`${ index + 1 }) ${ value.content } <i><b>(${ textAuthorLang }: ${ value.author.name })</b></i>`);
            else
                messages.push(`${ index + 1 }) ${ value.content }`);
        });

    const isMyList = list.authorId === user.id;
    const expiresAt = getFutureMinutes(15);

    return {
        messagesId,
        message: messages.join('\n'),
        keyboard: new InlineKeyboard()
            .text(getLanguageString(user.language, 'add-note-in-list')!, ActionNotePayload.pack({ userId: user.id, action: TypeActionNote.ADD, listId, expiresAt }))
            .text(getLanguageString(user.language, 'change-note-in-list')!, ActionNotePayload.pack({ userId: user.id, action: TypeActionNote.CHANGE, listId, expiresAt }))
            .text(getLanguageString(user.language, 'delete-note-in-list')!, ActionNotePayload.pack({ userId: user.id, action: TypeActionNote.DELETE, listId, expiresAt }))
            .row()
            .text(getLanguageString(user.language, 'refresh-list')!, ActionNotePayload.pack({ userId: user.id, listType: listType, action: TypeActionNote.REFRESH, listId, expiresAt }))
            .addIf(
                isMyList,
                InlineKeyboard.text(getLanguageString(user.language, 'change-title-list')!, ActionListPayload.pack({ userId: user.id, type: listType, action: TypeActionList.CHANGE, listId, expiresAt }))
            )
            .addIf(
                listType !== TypeList.MAIN && isMyList,
                InlineKeyboard.text(getLanguageString(user.language, 'delete-list')!, ActionListPayload.pack({ userId: user.id, type: listType, action: TypeActionList.DELETE, listId, expiresAt }))
            )
            .addIf(
                !isMyList,
                InlineKeyboard.text(getLanguageString(user.language, 'leave-list')!, ActionListPayload.pack({ userId: user.id, type: listType, action: TypeActionList.LEAVE, listId, expiresAt }))
            )
            .row()
            .addIf(
                listType === TypeList.SHARED && isMyList,
                InlineKeyboard.text(getLanguageString(user.language, 'kick-user-from-list')!, ActionListPayload.pack({ userId: user.id, action: TypeActionList.KICK_USER, type: listType, listId, expiresAt }))
            )
            .addIf(
                listType !== TypeList.MAIN && isMyList,
                InlineKeyboard.text(getLanguageString(user.language, 'share-list')!, ActionListPayload.pack({ userId: user.id, type: listType, action: TypeActionList.SHARE, listId, expiresAt }))
            )
            .text(getLanguageString(user.language, 'back-to-list')!, ActionListPayload.pack({ userId: user.id, action: TypeActionList.REFRESH, listId, expiresAt }))
            .build()
    };
};