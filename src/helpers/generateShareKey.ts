import { randomUUID } from 'crypto';
import { SHARED_KEYS } from '../constants';
import { IShareParam } from '../interfaces';

export const generateShareKey = (params: IShareParam): string => {
    const key = randomUUID().replace(/-/g, '').toUpperCase();
    if (SHARED_KEYS[key])
        return generateShareKey(params);

    setTimeout(() => {
        delete SHARED_KEYS[key];
    }, params.expiresAtMinutes * 60 * 1000);

    SHARED_KEYS[key] = params;
    return key;
};