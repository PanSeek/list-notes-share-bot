import { TCallbackCommand, TLanguage } from '../types';
import { Commands } from '../classes/commands';
import { getLanguageString, removeSpacesInsideString } from '../helpers';

export const help: TCallbackCommand = async (context) => {
    const userLang = context.session.user.language.toLowerCase() as TLanguage;

    let str = `<b>${ getLanguageString(userLang, 'bot-commands')! }:</b>\n\n`;
    for (const name in Commands.list) {
        const command = Commands.list[name];
        const description = command.description[userLang];
        let args = '';
        if (command.args)
            args = command.args[userLang];

        str += removeSpacesInsideString(`/${ name } ${ args } - <b>${ description }</b>\n`);
    }

    str += '\n';
    str += `<i>${ getLanguageString(userLang, 'explanation-args-mandatory')! }\n${ getLanguageString(userLang, 'explanation-args-optional')! }</i>`;

    return await context.send(str);
};