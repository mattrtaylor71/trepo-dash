/**
 * Chart utility functions for processing time-based data
 */

export type TimeRange = 'week' | 'month' | '3months' | '6months' | 'year' | 'all'

export interface DailyActivity {
  date: string
  count: number
  actions: Record<string, number>
}

/**
 * Gets the start date for a given time range
 */
export function getStartDateForRange(range: TimeRange): Date {
  const now = new Date()
  const start = new Date(now)
  
  switch (range) {
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case '3months':
      start.setMonth(now.getMonth() - 3)
      break
    case '6months':
      start.setMonth(now.getMonth() - 6)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
    case 'all':
      return new Date(0) // Beginning of time
  }
  
  return start
}

/**
 * Formats date for display
 */
export function formatDateForDisplay(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

/**
 * Gets date key for grouping (YYYY-MM-DD format)
 */
export function getDateKey(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Groups activities by date
 */
export function groupActivitiesByDate(
  activities: any[],
  dateField: string = '_createdDate',
  range: TimeRange = 'all'
): DailyActivity[] {
  const startDate = getStartDateForRange(range)
  const dateMap = new Map<string, DailyActivity>()
  
  activities.forEach((activity) => {
    // Try multiple possible date field names
    let dateStr = activity[dateField]
    if (!dateStr) {
      // Fallback to common date field names
      dateStr = activity._createdDate || activity.created_at || activity._createddate || activity.createdDate
    }
    if (!dateStr) return
    
    const activityDate = new Date(dateStr)
    if (isNaN(activityDate.getTime())) return // Invalid date
    if (activityDate < startDate) return // Filter by range
    
    const dateKey = getDateKey(activityDate)
    
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: dateKey,
        count: 0,
        actions: {}
      })
    }
    
    const daily = dateMap.get(dateKey)!
    daily.count++
    
    const action = activity.action || 'UNKNOWN'
    daily.actions[action] = (daily.actions[action] || 0) + 1
  })
  
  // Convert to array and sort by date
  const result = Array.from(dateMap.values()).sort((a, b) => 
    a.date.localeCompare(b.date)
  )
  
  return result
}

/**
 * Gets label for time range
 */
export function getTimeRangeLabel(range: TimeRange): string {
  const labels: Record<TimeRange, string> = {
    week: 'Past Week',
    month: 'Past Month',
    '3months': 'Past 3 Months',
    '6months': 'Past 6 Months',
    year: 'Past Year',
    all: 'All Time'
  }
  return labels[range]
}

