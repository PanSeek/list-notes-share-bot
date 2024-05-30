import { print } from './helpers';
import { config } from 'dotenv';
import { get } from 'env-var';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
print('env file', envFile);

config({ path: envFile });

export const TOKEN = get('TOKEN').required().asString();