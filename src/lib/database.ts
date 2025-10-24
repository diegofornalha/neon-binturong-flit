import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

// Define the generic shape of your database for the template.
interface DbSchema {
  examples: { id: number; name: string; createdAt: string }[];
  settings?: {
    facebook?: {
      appId: string;
      appSecret: string;
      accessToken: string;
      accounts: any[];
      updatedAt: string;
    };
    google?: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      developerId: string;
      accounts: any[];
      updatedAt: string;
    };
  };
  clients?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
  }[];
}

// Define the path for the JSON database file
const DB_FILE_NAME = 'db.json';
const DB_DIR_PATH = process.env.DATABASE_DIR || './data';
const DB_FULL_PATH = path.resolve(process.cwd(), DB_DIR_PATH, DB_FILE_NAME);

let dbInstance: Low<DbSchema> | null = null;

/**
 * Initializes and returns a singleton Lowdb database instance.
 */
export async function getDb(): Promise<Low<DbSchema>> {
  if (dbInstance) {
    if (dbInstance.data) {
      return dbInstance;
    }
    await dbInstance.read();
    return dbInstance;
  }

  try {
    // Ensure the directory for the database file exists
    const dir = path.dirname(DB_FULL_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const adapter = new JSONFile<DbSchema>(DB_FULL_PATH);
    // Provide initial structure with settings
    dbInstance = new Low<DbSchema>(adapter, { 
      examples: [],
      settings: {},
      clients: []
    });

    await dbInstance.read();

    console.log(`Database initialized/loaded from: ${DB_FULL_PATH}`);

    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize Lowdb database:', error);
    throw error;
  }
}