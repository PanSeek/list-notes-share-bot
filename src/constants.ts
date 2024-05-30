import { IShareParam } from './interfaces';

export const URL_GITHUB_REPOSITORY = 'https://github.com/PanSeek/list-notes-share-bot';
export const MINUTE_IN_MS = 1000 * 60;
export const TIME_LIFE_SESSION = MINUTE_IN_MS * 5;
export const MINUTE_LIFE_SHARED_KEY = 5;
export const SHARED_KEYS: { [id: string]: IShareParam } = { };