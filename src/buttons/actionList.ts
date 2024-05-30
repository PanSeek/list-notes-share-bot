import { CallbackDataBuilder } from '@puregram/callback-data';

export const ActionListPayload =  CallbackDataBuilder.create('action_list')
    .number('userId')
    .number('listId', { optional: true })
    .number('expiresAt')
    .number('type', { default: -1 })
    .number('action');