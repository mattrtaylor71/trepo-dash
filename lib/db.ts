/**
 * MySQL Database Connection Utility
 * 
 * Handles connection to MySQL database using mysql2
 */

import mysql from 'mysql2/promise'

// Database configuration - all environment variables are required
if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_PASSWORD) {
  throw new Error('Missing required database environment variables: DB_USER, DB_HOST, DB_NAME, and DB_PASSWORD must be set')
}

const dbConfig = {
  user: process.env.DB_USER!,
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  password: process.env.DB_PASSWORD!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

/**
 * Creates a new MySQL connection
 */
export async function getConnection() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  })

  return connection
}

/**
 * Executes a query and returns results
 */
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  const connection = await getConnection()
  
  try {
    const [rows] = await connection.execute(query, params)
    return rows as T[]
  } finally {
    await connection.end()
  }
}

/**
 * Tests the database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection()
    await connection.ping()
    await connection.end()
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

