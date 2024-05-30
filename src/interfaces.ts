import { TCallbackCommand } from './types';
import { User } from '@prisma/client';
import { SceneContext } from '@puregram/scenes';

export interface ISession {
    session: {
        user: User;
        args: string[];
        command: ICommand;
        commandName: string;
    }
}

export interface IScene {
    scene: SceneContext;
}

export interface IShareParam {
    authorId: number;
    listId: number;
    expiresAtMinutes: number;
}

export interface ILanguageStringType {
    ru: string;
    en: string;
}

export interface ICommand {
    description: ILanguageStringType;
    callback: TCallbackCommand;

    descriptionCommand?: ILanguageStringType;
    args?: ILanguageStringType;
    isAdmin?: boolean;
    isDisabled?: boolean;
}