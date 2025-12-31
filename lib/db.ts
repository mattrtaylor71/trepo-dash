/**
 * MySQL Database Connection Utility
 * 
 * Handles connection to MySQL database using mysql2
 */

import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'database-1.cvig8u6s25dz.us-east-1.rds.amazonaws.com',
  database: process.env.DB_NAME || 'mysqlTutorial',
  password: process.env.DB_PASSWORD || '', // Must be set via environment variable
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

/**
 * Creates a new MySQL connection
 */
export async function getConnection() {
  if (!dbConfig.password) {
    throw new Error('DB_PASSWORD environment variable is required')
  }

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

