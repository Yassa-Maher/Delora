import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'GMAIL_EMAIL', 'GMAIL_APP_PASSWORD'];
const missing = required.filter(k => !process.env[k]);

if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

export default {
    port: parseInt(process.env.PORT, 10) || 5000,
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    jwtSecret: process.env.JWT_SECRET,
    gmail: {
        email: process.env.GMAIL_EMAIL,
        appPassword: process.env.GMAIL_APP_PASSWORD
    },
    upload: {
        maxSize: 100 * 1024 * 1024
    },
    pagination: {
        defaultLimit: 20,
        maxLimit: 100
    }
};
