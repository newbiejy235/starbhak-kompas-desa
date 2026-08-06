// import "dotenv/config";
// import { drizzle } from "drizzle-orm/mysql2";
// import { neon } from '@neondatabase/serverless'

// const poolConnection = mysql.createPool(process.env.DATABASE_URL!);

// export const db = drizzle(poolConnection);

dotenv.config();
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'; 
import dotenv from 'dotenv';


const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
