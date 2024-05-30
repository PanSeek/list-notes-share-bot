import { prisma } from '../instances';
import { Language, User } from '@prisma/client';
import { TLanguage } from '../types';
import { getLanguageString } from './getLanguageString';
import { getFutureMinutes } from './getFutureMinutes';
import { TypeActionList, TypeList } from '../enums';
import { ActionListPayload, ListPayload } from '../buttons';
import { LocalesMap } from '../languages';
import { InlineKeyboard } from '@gramio/keyboards';

interface IResult {
    id: number;
    name: string;
    type: TypeList;
    expiresAt: number;
    isMy: boolean;
}

const getStrType = (language: Language | TLanguage, type: TypeList) => {
    let t: keyof LocalesMap = 'explanation-main-list';
    if (type === TypeList.SHARED)
        t = 'explanation-shared-list';
    else if (type === TypeList.PRIVATE)
        t = 'explanation-private-list';
    return getLanguageString(language, t)![0];
};

const getStrNumber = (num: number, isMy: boolean) => {
    if (!isMy)
        return num.toString();
    return `<b>${ num }</b>`;
};

export const getLists = async (user: User) => {
    const listsAccess = await prisma.userAccessList.findMany({ where: { user }, include: { list: true } });
    const listsPrivate = await prisma.list.findMany({
        where: { author: user },
        include: { accessUsers: { include: { list: true } } }
    });
    const listsResult: IResult[] = [ ];

    const expiresAt = getFutureMinutes(15);

    listsPrivate.forEach((value, idx) => {
        const accessList = listsPrivate[idx].accessUsers.find((valueAccess) => valueAccess.listId === value.id);
        listsResult.push({
            id: value.id,
            name: value.name,
            type: accessList ? TypeList.SHARED : (value.isMain ? TypeList.MAIN : TypeList.PRIVATE),
            isMy: true,
            expiresAt
        });
    });

    listsAccess.forEach((value) => {
        listsResult.push({
            id: value.listId,
            type: TypeList.SHARED,
            name: value.list.name,
            isMy: false,
            expiresAt
        });
    });

    let result = listsResult.reduce((acc, value, idx) =>
        acc + `${ getStrNumber(idx + 1, value.isMy) }) [${ getStrType(user.language, value.type) }] ${ value.name }\n`, `<b>${ getLanguageString(user.language, 'lists') }</b>:\n\n`
    );
    result += '\n' + getLanguageString(user.language, 'explanation-lists')!;

    // TODO: Arrow NEXT/PREVIOUS.
    const keyboardLists = new InlineKeyboard()
        .columns(3)
        .add(...listsResult.map((value) =>
            InlineKeyboard.text(value.name, ListPayload.pack({ listId: value.id, type: value.type, userId: user.id, expiresAt }))
        ));

    const keyboardDown = new InlineKeyboard()
        .text(getLanguageString(user.language, 'refresh-list')!, ActionListPayload.pack({ userId: user.id, action: TypeActionList.REFRESH, expiresAt }))
        .text(getLanguageString(user.language, 'create-list')!, ActionListPayload.pack({ userId: user.id, action: TypeActionList.ADD, expiresAt }));

    return {
        message: result,
        keyboard: new InlineKeyboard()
            .combine(keyboardLists)
            .row()
            .combine(keyboardDown)
            .build()
            .inline_keyboard
    };
};