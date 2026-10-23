import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  throw new Error('Defina SUPABASE_DATABASE_URL com a connection string PostgreSQL do Supabase.');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const normalizePostgresQuery = (sql, params = []) => {
  let paramIndex = 0;
  const normalized = sql.replace(/\?/g, () => {
    paramIndex += 1;
    return `$${paramIndex}`;
  });

  return { text: normalized, values: params };
};

const isInsert = (sql) => /^\s*INSERT\b/i.test(sql);

const withReturningId = (sql) => {
  if (!isInsert(sql) || /\bRETURNING\b/i.test(sql)) return sql;
  return `${sql.trim().replace(/;$/, '')} RETURNING id`;
};

const executeQuery = async (client, sql, params = []) => {
  const query = withReturningId(sql);
  const { text, values } = normalizePostgresQuery(query, params);
  const result = await client.query(text, values);

  if (isInsert(sql)) {
    const insertedRow = result.rows?.[0] || {};
    return [{
      insertId: insertedRow.id ?? null,
      affectedRows: Number(result.rowCount || 0),
      warningStatus: 0,
      ...insertedRow,
    }, result.fields || []];
  }

  return [result.rows || [], result.fields || []];
};

const db = {
  async query(sql, params = []) {
    return executeQuery(pool, sql, params);
  },
  async transaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const transactionDb = {
        query: (sql, params = []) => executeQuery(client, sql, params),
      };
      const result = await callback(transactionDb);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  async end() {
    await pool.end();
  },
};

export default db;

