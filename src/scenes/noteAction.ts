import { sceneManager } from './manager';
import { prisma } from '../instances';
import { User } from '@prisma/client';
import { StepScene } from '@puregram/scenes';
import { getLanguageString, validatorNote } from '../helpers';
import { ActionNotePayload } from '../buttons';
import { TypeActionNote } from '../enums';
import { GetCallbackDataPayload } from '../types';
import { ISession } from '../interfaces';

type TActionNotePayload = GetCallbackDataPayload<typeof ActionNotePayload> & { notesId: { [id: number]: number } };

sceneManager.addScenes([
    new StepScene<ISession>('noteAction', {
        steps: [
            async (context) => {
                const user = context.session.user as User;
                const payload = context.scene.state as TActionNotePayload;

                let writeNoteText = getLanguageString(user.language, 'enter-note-number')! + '\n' + getLanguageString(user.language, 'enter-quit-cancel-action')!;
                if (payload.action === TypeActionNote.ADD)
                    writeNoteText = getLanguageString(user.language, 'write-note')! + '\n' + getLanguageString(user.language, 'enter-quit-cancel-action')!;

                if (context.is('callback_query')) {
                    await context.answerCallbackQuery();
                    // @ts-ignore
                    if (payload.notesId.length <= 0 && payload.action !== TypeActionNote.ADD) {
                        await context.message!.send(getLanguageString(user.language, 'not-found-notes')!);
                        return await context.scene.leave();
                    }
                    return await context.message!.send(writeNoteText);
                }

                if (context.is('message')) {
                    if (!context.text)
                        return await context.send(writeNoteText);

                    if (payload.action === TypeActionNote.ADD) {
                        if (!validatorNote(context.text))
                            return await context.send(writeNoteText);

                        await prisma.note.create({
                            data: {
                                content: context.text,
                                author: { connect: { id: user.id } },
                                list: { connect: { id: payload.listId } }
                            }
                        });
                        await context.send(getLanguageString(user.language, 'success-created-note')!);
                        return await context.scene.leave();
                    }

                    if (payload.notesId[Number(context.text)] !== undefined) {
                        context.scene.state.selectId = Number(context.text);
                        return await context.scene.step.next();
                    }
                    return await context.send(writeNoteText);
                }
            },

            async (context) => {
                if (!context.is('message'))
                    return;

                const user = context.session.user as User;
                const payload = context.scene.state as TActionNotePayload;
                const noteId = payload.notesId[context.scene.state.selectId];

                if (payload.action === TypeActionNote.DELETE) {
                    const deletedNote = await prisma.note.delete({ where: { id: noteId } })
                        .catch(() => null);

                    if (!deletedNote)
                        await context.send(getLanguageString(user.language, 'failed-delete-note')!);
                    else
                        await context.send(`${ getLanguageString(user.language, 'success-deleted-note')! }:\n> ${ context.scene.state.selectId }) ${ deletedNote.content }`);

                    return await context.scene.leave();
                }

                else if (payload.action === TypeActionNote.CHANGE) {
                    await context.send(getLanguageString(user.language, 'write-note')! + '\n' + getLanguageString(user.language, 'enter-quit-cancel-action')!);
                    return await context.scene.step.next();
                }
            },

            async (context) => {
                if (!context.is('message') || context.scene.step.firstTime)
                    return;

                const user = context.session.user as User;
                if (!context.text || !validatorNote(context.text))
                    return await context.send(getLanguageString(user.language, 'write-note')! + '\n' + getLanguageString(user.language, 'enter-quit-cancel-action')!);

                const payload = context.scene.state as TActionNotePayload;
                const noteId = payload.notesId[context.scene.state.selectId];

                const changedNote = await prisma.note.update({
                    where: { id: noteId },
                    data: { content: context.text }
                });

                await context.send(`${ getLanguageString(user.language, 'success-changed-note')! }:\n> ${ context.scene.state.selectId }) ${ changedNote.content }`);
                return await context.scene.leave();
            }
        ]
    })
]);