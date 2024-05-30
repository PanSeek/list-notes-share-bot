import { CallbackDataBuilder } from '@puregram/callback-data';

export const ActionNotePayload =  CallbackDataBuilder.create('action_note')
    .number('userId')
    .number('listId')
    .number('listType', { optional: true })
    .number('expiresAt')
    .number('action');