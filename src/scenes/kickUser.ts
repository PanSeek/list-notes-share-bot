import { sceneManager } from './manager';
import { prisma } from '../instances';
import { List, User } from '@prisma/client';
import { StepScene } from '@puregram/scenes';
import { getLanguageString } from '../helpers';
import { ActionListPayload } from '../buttons';
import { GetCallbackDataPayload } from '../types';
import { ISession } from '../interfaces';

type TActionListPayload = GetCallbackDataPayload<typeof ActionListPayload> & { list: List, users: Pick<User, 'id' | 'name'>[] };

sceneManager.addScenes([
    new StepScene<ISession>('kickUser', {
        steps: [
            async (context) => {
                const user = context.session.user as User;
                const payload = context.scene.state as TActionListPayload;

                const enterUserNumberText = getLanguageString(user.language, 'enter-user-number')! + '\n' + getLanguageString(user.language,  'enter-quit-cancel-action')!;

                if (context.is('callback_query')) {
                    await context.answerCallbackQuery();

                    await context.message!.send(payload.users.reduce((acc, value, idx) => acc + `${ idx + 1 }) ${ value.name }\n`, getLanguageString(user.language, 'users-list-name', { name: payload.list.name })! + '\n\n'));
                    return await context.message!.send(enterUserNumberText);
                }

                if (context.is('message')) {
                    const inputUser = payload.users[Number(context.text) - 1];
                    if (!context.text || !inputUser)
                        return await context.send(enterUserNumberText);

                    const deletedUser = await prisma.userAccessList.deleteMany({ where: { listId: payload.listId, userId: inputUser.id } });

                    if (!deletedUser.count)
                        await context.send(getLanguageString(user.language, 'failed-kick-user-list')!);
                    else
                        await context.send(getLanguageString(user.language, 'success-kick-user-list', { name: inputUser.name })!);

                    return await context.scene.leave();
                }
            }
        ]
    })
]);