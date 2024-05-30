import { TOKEN } from './env';
import { Telegram } from 'puregram';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const bot = new Telegram({
    token: TOKEN
});