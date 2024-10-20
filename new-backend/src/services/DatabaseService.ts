// src/services/DatabaseService.ts
import { injectable, singleton } from "tsyringe";
import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

@singleton()
@injectable()
export class DatabaseService {
  private db: PostgresJsDatabase<typeof schema>;
  private client: postgres.Sql;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in the environment variables');
    }

    console.log('Initializing database connection...');

    this.client = postgres(process.env.DATABASE_URL, { 
      prepare: false,
    });

    this.db = drizzle(this.client, { schema });

    console.log('Database connection initialized');
  }

  getDb() {
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.end();
      console.log('Database connection closed');
    }
  }
}