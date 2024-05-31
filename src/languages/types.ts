import type {
    FluentBundle,
    FluentVariable,
    Message as FluentMessage,
    // @ts-ignore
} from "@fluent/bundle"

export interface LocalesMap {
    "miss-arguments": never
    "unidentified-error": never
    "expired-minutes": never
    "you-already-on-list": never
    "cannot-delete-main-list": never
    "cannot-leave-main-list": never
    "cannot-share-main-list": never
    "failed-delete-main-list": never
    "failed-delete-note": never
    "failed-leave-list": never
    "failed-kick-user-list": never
    "failed-signup-nickname": {
        name: FluentVariable
    }
    "not-author-list": never
    "not-found-list": never
    "not-found-main-list": never
    "not-found-notes": never
    "not-found-users-list": never
    "new-note-in-list": never
    "language-change-on": {
        language: FluentVariable
    }
    "success-signup": never
    "success-cancel-action": never
    "success-created-note": never
    "success-changed-note": never
    "success-deleted-note": never
    "success-created-list": {
        name: FluentVariable
    }
    "success-changed-list": {
        oldname: FluentVariable
        newname: FluentVariable
    }
    "success-deleted-list": {
        name: FluentVariable
    }
    "success-join-list": never
    "success-leave-list": never
    "success-kick-user-list": {
        name: FluentVariable
    }
    about: never
    "explanation-share-list": {
        minutes: FluentVariable
    }
    "explanation-lists": never
    list: never
    lists: never
    note: never
    author: never
    "bot-commands": never
    "write-own-nickname": never
    "write-name-list": never
    "write-note": never
    "explanation-args-mandatory": never
    "explanation-args-optional": never
    "explanation-main-list": never
    "explanation-private-list": never
    "explanation-shared-list": never
    "enter-note-number": never
    "enter-user-number": never
    "enter-quit-cancel-action": never
    "empty-notes": never
    "select-language": never
    "users-list-name": {
        name: FluentVariable
    }
    "get-lists": never
    commands: never
    "language-change": never
    "back-to-list": never
    "refresh-list": never
    "create-list": never
    "delete-list": never
    "leave-list": never
    "share-list": never
    "change-title-list": never
    "add-note-in-list": never
    "change-note-in-list": never
    "delete-note-in-list": never
    "kick-user-from-list": never
}

export interface Message<Key extends keyof LocalesMap> extends FluentMessage {
    id: Key
}

export interface TypedFluentBundle extends FluentBundle {
    getMessage<Key extends keyof LocalesMap>(key: Key): Message<Key>
    formatPattern<Key extends keyof LocalesMap>(
        key: Key,
        ...args: LocalesMap[Key] extends never ? [] : [args: LocalesMap[Key]]
    ): string
    formatPattern<Key extends keyof LocalesMap>(
        key: Key,
        args: LocalesMap[Key] extends never ? null : LocalesMap[Key],
        errors?: Error[] | null,
    ): string
}
