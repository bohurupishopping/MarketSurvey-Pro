import { neon } from '@neondatabase/serverless';

const sql = neon((import.meta as any).env.VITE_DATABASE_URL);

export default sql;
