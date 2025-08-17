import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import postgres from 'postgres';

config({ path: path.resolve(process.cwd(), '.env.local') });

const client = postgres(process.env.DATABASE_URL!);
const dbConnection = drizzle({ client });

const database = process.env.DATABASE_URL

if (!database || database === '' || database === 'undefined') {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const migrateDb = async () => {
    console.log('Migrating database...', process.env.DATABASE_URL);
    try {
        await migrate(dbConnection, {
            migrationsFolder: "./db/migrations",
        });
        console.log('Database migration successful');
    } catch (error) {
        console.error('Database migration error:', error);
    } finally {
        await client.end();
    }
}

migrateDb();