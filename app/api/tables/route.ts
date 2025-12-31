import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

/**
 * API Route to discover tables ending with "_new_feed"
 */
export async function GET() {
  try {
    // Query to find all tables ending with "_new_feed"
    // Using RIGHT() function to avoid LIKE wildcard issues with underscore
    // The underscore in LIKE is a wildcard, so we use RIGHT() instead
    const query = `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND RIGHT(TABLE_NAME, 9) = '_new_feed'
      ORDER BY TABLE_NAME
    `

    console.log('[API] Executing table discovery query...')
    const tables = await executeQuery<{ TABLE_NAME: string }>(query)
    
    console.log(`[API] Raw query result:`, tables)
    
    const tableNames = tables.map(row => row.TABLE_NAME)

    console.log(`[API] Found ${tableNames.length} tables ending with "_new_feed":`)
    tableNames.forEach((name, idx) => {
      console.log(`  ${idx + 1}. ${name}`)
    })

    return NextResponse.json({
      success: true,
      tables: tableNames,
      count: tableNames.length
    })
  } catch (error: any) {
    console.error('[API] Error discovering tables:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to discover tables',
        tables: []
      },
      { status: 500 }
    )
  }
}

