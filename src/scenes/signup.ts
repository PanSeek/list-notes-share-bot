import { StepScene } from '@puregram/scenes';
import { sceneManager } from './manager';
import { InlineKeyboardBuilder } from 'puregram';
import { getLanguageString, validatorNickname } from '../helpers';
import { Language } from '@prisma/client';
import { prisma } from '../instances';

sceneManager.addScenes([
    new StepScene('signup', {
        steps: [
            async (context) => {
                if (context.is('message') && !context.scene.state.language) {
                    const text = getLanguageString('ru', 'select-language')! + '\n' + getLanguageString('en', 'select-language')!;
                    await context.send(text, {
                        reply_markup: new InlineKeyboardBuilder()
                            .textButton({ text: '🇷🇺', payload: 'signup:language:ru' })
                            .textButton({ text: '🇬🇧', payload: 'signup:language:en' })
                    });
                }
                
                if (context.is('callback_query') && (context.queryPayload === 'signup:language:en' || context.queryPayload === 'signup:language:ru')) {
                    await context.answerCallbackQuery();

                    const language: Language = context.queryPayload === 'signup:language:en' ? 'EN' : 'RU';
                    context.scene.state.language = language;
                    await context.telegram.api.sendMessage({
                        text: getLanguageString(language, 'write-own-nickname')!,
                        chat_id: context.message!.chatId
                    });
                    await context.scene.step.next();
                }
            },

            async (context) => {
                if (!context.is('message') || !context.hasText())
                    return;

                const nickname = context.text;
                if (!validatorNickname(nickname))
                    return await context.send(getLanguageString(context.scene.state.language, 'write-own-nickname')!);

                const userFind = await prisma.user.findMany({ where: { name: { contains: nickname, mode: 'insensitive' } } });
                if (userFind.length > 0)
                    return await context.send(getLanguageString(context.scene.state.language, 'failed-signup-nickname', { name: nickname })!);

                context.scene.state.nickname = nickname;

                const user = await prisma.user.upsert({
                    where: { telegramId: context.senderId! },
                    update: {},
                    create: {
                        telegramId: context.senderId!,
                        name: context.scene.state.nickname,
                        language: context.scene.state.language
                    }
                });

                await prisma.list.create({
                    data: {
                        name: 'Main',
                        isMain: true,
                        author: { connect: { id: user.id } },
                        notes: {
                            create: []
                        }
                    }
                });

                await context.send(getLanguageString(context.scene.state.language,  'success-signup')!);

                console.log(context.scene.state);
                await context.scene.leave();
            }
        ]
    })
]);