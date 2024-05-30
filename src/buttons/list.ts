import { CallbackDataBuilder } from '@puregram/callback-data';

export const ListPayload =  CallbackDataBuilder.create('list')
    .number('userId')
    .number('listId')
    .number('expiresAt')
    .number('type');