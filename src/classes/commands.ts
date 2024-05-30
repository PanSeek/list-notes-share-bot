import { ICommand } from '../interfaces';
import { TelegramBotCommand } from 'puregram/lib/generated';

interface IList {
    [name: string]: ICommand;
}

class Cmds {
    private _list: IList = { };

    public get list() {
        return this._list;
    }

    public get count() {
        let count = 0;
        for (const name in this._list)
            count++;
        return count;
    }

    public register(name: string, options: ICommand) {
        this._list[name] = options;
    }

    public generateMyCommand(): TelegramBotCommand[] {
        const list: TelegramBotCommand[] = [];
        for (const name in this._list) {
            const data = this._list[name];
            const description = !data.descriptionCommand ? data.description : data.descriptionCommand;
            list.push({ command: '/' + name, description: `${ description.en } / ${ description.ru }` });
        }
        return list;
    }
}

export const Commands = new Cmds();