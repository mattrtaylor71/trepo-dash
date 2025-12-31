import { NextResponse } from 'next/server'
import { executeQuery, getConnection } from '@/lib/db'
import mysql from 'mysql2/promise'
import { convertToLATime } from '@/lib/utils'

/**
 * API Route to fetch data from a specific table
 */
export async function GET(
  request: Request,
  { params }: { params: { tableName: string } }
) {
  try {
    const { tableName } = params

    // Validate table name to prevent SQL injection
    // Only allow alphanumeric, underscore, hyphen, and ensure it ends with _new_feed
    // This allows UUIDs like "247942d3-73d6-44c4-9311-ccffe1acc5bf_new_feed"
    if (!/^[a-zA-Z0-9_-]+_new_feed$/.test(tableName)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid table name. Table must end with "_new_feed"'
        },
        { status: 400 }
      )
    }

    // Get column names first
    const columnQuery = `
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `
    
    const columns = await executeQuery<{ COLUMN_NAME: string }>(
      columnQuery,
      [tableName]
    )
    
    const columnNames = columns.map(col => col.COLUMN_NAME)

    if (columnNames.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Table "${tableName}" not found or has no columns`
        },
        { status: 404 }
      )
    }

    // Fetch data from table (limit to 1000 rows for performance)
    // Use mysql.format to safely escape table name
    const connection = await getConnection()
    try {
      // Find the date column - check multiple possible names
      const possibleDateFields = ['_createdDate', 'created_at', '_createddate', 'createdDate', 'createdAt']
      const dateField = columnNames.find(col => 
        possibleDateFields.includes(col.toLowerCase())
      ) || null
      
      // Build query with proper escaping using mysql.format
      // Since we've already validated tableName and dateField, we can safely use them
      let formattedQuery: string
      if (dateField) {
        // Use mysql.format with ?? for identifiers (table/column names)
        formattedQuery = mysql.format('SELECT * FROM ?? ORDER BY ?? DESC LIMIT 1000', [tableName, dateField])
      } else {
        formattedQuery = mysql.format('SELECT * FROM ?? LIMIT 1000', [tableName])
      }
      
      console.log(`[API] Fetching from ${tableName}`)
      console.log(`[API] Date field found: ${dateField || 'none'}`)
      console.log(`[API] Available columns: ${columnNames.join(', ')}`)
      
      const [rows] = await connection.execute(formattedQuery)
      const rawData = rows as any[]
      
      // Convert UTC timestamps to LA time and process data
      // Normalize date field to _createdDate for consistency
      const data = rawData.map(row => {
        const processedRow = { ...row }
        
        // Find and normalize the date field
        let dateValue = null
        if (dateField && row[dateField]) {
          dateValue = row[dateField]
        } else {
          // Try to find any date field
          for (const field of possibleDateFields) {
            if (row[field]) {
              dateValue = row[field]
              break
            }
          }
        }
        
        // Convert to LA time and store as _createdDate for consistency
        if (dateValue) {
          processedRow._createdDate = convertToLATime(dateValue)
          processedRow._createdDateUTC = dateValue // Keep original for reference
          // Also keep the original field name for reference
          if (dateField && dateField !== '_createdDate') {
            processedRow[`_original_${dateField}`] = dateValue
          }
        }
        
        return processedRow
      })
      
      console.log(`[API] Successfully pulled ${data.length} rows from ${tableName}`)
      console.log(`[API] Columns: ${columnNames.join(', ')}`)
      console.log(`[API] Date field used: ${dateField || 'none found'}`)
      if (data.length > 0) {
        const sampleRow = data[0]
        console.log(`[API] Sample row date fields:`, {
          _createdDate: sampleRow._createdDate,
          created_at: sampleRow.created_at,
          _createddate: sampleRow._createddate,
          allKeys: Object.keys(sampleRow).filter(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('created'))
        })
      }

      return NextResponse.json({
        success: true,
        tableName,
        message: `Successfully pulled ${data.length} rows from ${tableName} table`,
        data,
        columns: columnNames,
        rowCount: data.length
      })
    } finally {
      await connection.end()
    }

  } catch (error: any) {
    console.error(`[API] Error fetching data from table:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch table data',
        data: [],
        columns: []
      },
      { status: 500 }
    )
  }
}

