import { Commands } from '../classes/commands';
import * as cmds from '../commands';

export const commands = () => {
    Commands.register('start', {
        callback: cmds.start,
        description: {
            ru: 'Приветствие',
            en: 'Greeting'
        }
    });

    Commands.register('help', {
        callback: cmds.help,
        description: {
            ru: 'Помощь',
            en: 'Help'
        }
    });

    Commands.register('list', {
        callback: cmds.list,
        description: {
            ru: 'Получить все доступные списки',
            en: 'Get all available listings'
        }
    });

    Commands.register('note', {
        callback: cmds.note,
        args: {
            ru: '[Текст]',
            en: '[Text]'
        },
        description: {
            ru: 'Быстро создать заметку в главном списке',
            en: 'Fast create a note in the main list'
        },
        descriptionCommand: {
            ru: 'Быстро создать заметку',
            en: 'Fast create a note'
        }
    });

    Commands.register('quit', {
        callback: cmds.quit,
        description: {
            ru: 'Отменить действие (мы сообщим когда это можно сделать)',
            en: 'Cancel action (we will let you know when this can be done)'
        },
        descriptionCommand: {
            ru: 'Отменить действие',
            en: 'Cancel action'
        }
    });

    Commands.register('language', {
        callback: cmds.language,
        description: {
            ru: 'Сменить язык / Change language',
            en: 'Change language / Сменить язык'
        },
        descriptionCommand: {
            ru: 'Сменить язык',
            en: 'Change language'
        }
    });
};