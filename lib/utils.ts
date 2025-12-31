/**
 * Utility functions for data processing
 */

/**
 * Converts UTC timestamp to Los Angeles (Pacific) time
 * @param utcDate - Date string or Date object in UTC
 * @returns Formatted date string in LA timezone
 */
export function convertToLATime(utcDate: string | Date): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  // Use Intl.DateTimeFormat to properly convert to LA timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  // Format the date parts
  const parts = formatter.formatToParts(date)
  const year = parts.find(p => p.type === 'year')?.value
  const month = parts.find(p => p.type === 'month')?.value
  const day = parts.find(p => p.type === 'day')?.value
  const hour = parts.find(p => p.type === 'hour')?.value
  const minute = parts.find(p => p.type === 'minute')?.value
  const second = parts.find(p => p.type === 'second')?.value
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * Gets a friendly action description
 */
export function getActionDescription(action: string): string {
  const actionMap: Record<string, string> = {
    'LISTIN': 'Item Added',
    'LISTOUT': 'Item Removed',
    'LISTUPDATE': 'Item Name Changed',
    'LISTSTORE': 'Item Store Updated',
    'CHECKED': 'Item Checked',
    'UNCHECKED': 'Item Unchecked'
  }
  
  return actionMap[action.toUpperCase()] || action
}

/**
 * Gets action color for UI
 */
export function getActionColor(action: string): string {
  const colorMap: Record<string, string> = {
    'LISTIN': '#10b981', // green
    'LISTOUT': '#ef4444', // red
    'LISTUPDATE': '#3b82f6', // blue
    'LISTSTORE': '#8b5cf6', // purple
    'CHECKED': '#f59e0b', // amber
    'UNCHECKED': '#6b7280' // gray
  }
  
  return colorMap[action.toUpperCase()] || '#6b7280'
}

/**
 * Extracts user ID from table name (UUID before _new_feed)
 */
export function extractUserId(tableName: string): string {
  return tableName.replace('_new_feed', '')
}

