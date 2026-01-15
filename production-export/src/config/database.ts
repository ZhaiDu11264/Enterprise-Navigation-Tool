import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  connectTimeout: number;
  multipleStatements: boolean;
}

const rawHost = process.env.DB_HOST || '127.0.0.1';
const normalizedHost = rawHost === 'localhost' ? '127.0.0.1' : rawHost;

const config: DatabaseConfig = {
  host: normalizedHost,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'enterprise_navigation',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  connectTimeout: 60000,
  multipleStatements: true,
};

// Create connection pool
const pool = mysql.createPool(config);

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Execute query with connection pool
export const executeQuery = async <T = unknown>(
  query: string,
  params?: unknown[]
): Promise<T[]> => {
  try {
    const [rows] = await pool.query(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a connection from the pool for transactions
export const getConnection = async (): Promise<mysql.PoolConnection> => {
  return await pool.getConnection();
};

// Close the connection pool
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('Database connection pool closed');
};

export default pool;
