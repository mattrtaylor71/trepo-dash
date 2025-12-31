/**
 * MySQL Service - Client-side service
 * 
 * This service handles API calls to fetch MySQL table data.
 * All database connections are handled server-side via API routes.
 */

interface QueryResult {
  message: string
  data: any[]
  columns: string[]
}

/**
 * Discovers all tables ending with "_new_feed"
 * @returns Promise with array of table names
 */
export async function discoverTables(): Promise<string[]> {
  try {
    const response = await fetch('/api/tables')
    const result = await response.json()
    
    if (result.success) {
      console.log(`[MySQL Service] Discovered ${result.count} tables ending with "_new_feed"`)
      return result.tables
    } else {
      throw new Error(result.error || 'Failed to discover tables')
    }
  } catch (error: any) {
    console.error('[MySQL Service] Error discovering tables:', error)
    throw error
  }
}

/**
 * Fetches data from a MySQL table via API
 * @param tableName - Name of the table to query
 * @returns Promise with query results
 */
export async function fetchTableData(tableName: string): Promise<QueryResult> {
  try {
    console.log(`[MySQL Service] Fetching data from table: ${tableName}`)
    
    const response = await fetch(`/api/tables/${encodeURIComponent(tableName)}`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || `Failed to fetch data from ${tableName}`)
    }
    
    if (result.success) {
      console.log(`[MySQL Service] Successfully pulled ${result.rowCount} rows from ${tableName}`)
      console.log(`[MySQL Service] Columns: ${result.columns.join(', ')}`)
      
      return {
        message: result.message,
        data: result.data,
        columns: result.columns
      }
    } else {
      throw new Error(result.error || 'Unknown error occurred')
    }
  } catch (error: any) {
    console.error(`[MySQL Service] Error fetching data from ${tableName}:`, error)
    throw error
  }
}

