import { sceneManager } from './manager';
import { prisma } from '../instances';
import { List, User } from '@prisma/client';
import { StepScene } from '@puregram/scenes';
import { getLanguageString, validatorNameList } from '../helpers';
import { ActionListPayload } from '../buttons';
import { TypeActionList } from '../enums';
import { GetCallbackDataPayload } from '../types';
import { ISession } from '../interfaces';

type TActionListPayload = GetCallbackDataPayload<typeof ActionListPayload> & { list: List };

sceneManager.addScenes([
    new StepScene<ISession>('listAction', {
        steps: [
            async (context) => {
                const user = context.session.user as User;
                const payload = context.scene.state as TActionListPayload;

                const writeNameListText = getLanguageString(user.language, 'write-name-list')! + '\n' + getLanguageString(user.language,  'enter-quit-cancel-action')!;

                if (context.is('callback_query')) {
                    await context.answerCallbackQuery();
                    return await context.message!.send(writeNameListText);
                }

                if (context.is('message')) {
                    if (!context.text || !validatorNameList(context.text))
                        return await context.send(writeNameListText);

                    if (payload.action === TypeActionList.ADD) {
                        const createdList = await prisma.list.create({ data: { authorId: user.id, name: context.text } });
                        await context.send(getLanguageString(user.language,  'success-created-list', { name: createdList.name })!);
                        return await context.scene.leave();
                    }
                    else if (payload.action === TypeActionList.CHANGE) {
                        const updatedList = await prisma.list.update({
                            where: { id: payload.listId, authorId: user.id },
                            data: { name: context.text }
                        });

                        await context.send(getLanguageString(user.language, 'success-changed-list', { oldname: payload.list.name ?? 'Unknown', newname: updatedList.name })!);
                        return await context.scene.leave();
                    }
                }
            }
        ]
    })
]);