'use client'

import { useState, useEffect } from 'react'
import { fetchTableData, discoverTables } from '@/services/mysqlService'
import { extractUserId, getActionDescription, getActionColor } from '@/lib/utils'
import UsageChart from '@/components/UsageChart'
import DailyActiveUsers from '@/components/DailyActiveUsers'
import './globals.css'

interface TableData {
  tableName: string
  status: 'success' | 'pending' | 'error'
  message: string
  data?: any[]
  columns?: string[]
}

interface UserStats {
  userId: string
  tableName: string
  totalInteractions: number
  firstActivity: string | null
  lastActivity: string | null
  actionBreakdown: Record<string, number>
  recentActivities: any[]
  allActivities: any[] // All activities for charting
  status: 'success' | 'pending' | 'error'
  errorMessage?: string | null
}

export default function Dashboard() {
  const [tables, setTables] = useState<TableData[]>([])
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setDiscovering(true)
    
    try {
      console.log('[Dashboard] Discovering tables ending with "_new_feed"...') // eslint-disable-line react/no-unescaped-entities
      const tableNames = await discoverTables()
      
      console.log(`[Dashboard] Discovered ${tableNames.length} table names:`, tableNames)
      
      if (tableNames.length === 0) {
        console.warn('[Dashboard] No tables found!')
        setLoading(false)
        setDiscovering(false)
        return
      }

      setDiscovering(false)
      console.log(`[Dashboard] Found ${tableNames.length} tables. Starting to fetch data...`)
      
      // Fetch data from all discovered tables
      const results = await Promise.all(
        tableNames.map(async (tableName) => {
          try {
            const result = await fetchTableData(tableName)
            return {
              tableName,
              status: 'success' as const,
              message: result.message,
              data: result.data,
              columns: result.columns
            }
          } catch (error: any) {
            return {
              tableName,
              status: 'error' as const,
              message: error.message || 'Failed to fetch data',
              data: [],
              columns: []
            }
          }
        })
      )
      
      setTables(results)
      
      // Log all results for debugging
      console.log(`[Dashboard] Processing ${results.length} tables:`)
      results.forEach((table, idx) => {
        console.log(`  ${idx + 1}. ${table.tableName}: ${table.status}, ${table.data?.length || 0} rows, message: ${table.message}`)
        if (table.status === 'error') {
          console.error(`    ERROR: ${table.message}`)
        }
      })
      
      // Process user statistics - Include ALL tables, even if empty or errored
      const stats = results.map(table => {
        const userId = extractUserId(table.tableName)
        const data = table.data || []
        
        // Calculate action breakdown (only if we have data)
        const actionBreakdown: Record<string, number> = {}
        if (table.status === 'success' && data.length > 0) {
          data.forEach((row: any) => {
            const action = row.action || 'UNKNOWN'
            actionBreakdown[action] = (actionBreakdown[action] || 0) + 1
          })
        }
        
        // Get first and last activity dates
        // Try multiple possible date field names
        const dates = data
          .map((row: any) => {
            // Check for normalized _createdDate first, then fallback to other common names
            return row._createdDate || row.created_at || row._createddate || row.createdDate || null
          })
          .filter((date: any) => date && date !== 'N/A')
          .sort()
        
        const firstActivity = dates.length > 0 ? dates[0] : null
        const lastActivity = dates.length > 0 ? dates[dates.length - 1] : null
        
        // Get recent activities (last 10) for timeline display
        const recentActivities = data.slice(0, 10)
        
        // Store all activities for charting
        const allActivities = data
        
        return {
          userId,
          tableName: table.tableName,
          totalInteractions: data.length,
          firstActivity,
          lastActivity,
          actionBreakdown,
          recentActivities,
          allActivities, // All activities for charting
          status: table.status,
          errorMessage: table.status === 'error' ? table.message : null
        }
      })
      .sort((a, b) => {
        // Sort: successful tables with data first, then by interaction count
        if (a.status === 'success' && b.status === 'success') {
          return b.totalInteractions - a.totalInteractions
        }
        if (a.status === 'success') return -1
        if (b.status === 'success') return 1
        return 0
      })
      
      console.log(`[Dashboard] Created stats for ${stats.length} users`)
      setUserStats(stats)
    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
      setDiscovering(false)
    }
  }

  const totalUsers = userStats.length
  const totalInteractions = userStats.reduce((sum, user) => sum + user.totalInteractions, 0)
  const avgInteractionsPerUser = totalUsers > 0 ? Math.round(totalInteractions / totalUsers) : 0

  // Collect all activities for overall chart
  const allActivities = tables
    .filter(table => table.status === 'success' && table.data)
    .flatMap(table => table.data || [])

  const selectedUserData = selectedUser 
    ? userStats.find(u => u.userId === selectedUser)
    : null

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>User Activity Dashboard</h1>
        <p>Analyzing user interactions from MySQL database tables (All times in LA/Pacific Time)</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading"></div>
          <p>
            {discovering 
              ? 'Discovering tables ending with "_new_feed"...' // eslint-disable-line react/no-unescaped-entities 
              : 'Loading dashboard data...'}
          </p>
        </div>
      ) : (
        <>
          {/* Daily Active Users Chart */}
          {userStats.length > 0 && (
            <DailyActiveUsers userStats={userStats.map(user => ({
              userId: user.userId,
              allActivities: user.allActivities || [],
              status: user.status
            }))} />
          )}

          {/* Overall Usage Chart */}
          {allActivities.length > 0 && (
            <UsageChart
              data={allActivities}
              title="Overall Usage Over Time"
              dateField="_createdDate"
              showActionBreakdown={false}
            />
          )}

          {/* Overall Summary */}
          <div className="summary-grid">
            <div className="summary-card">
              <h3>Overall Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{totalInteractions}</div>
                  <div className="stat-label">Total Interactions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{avgInteractionsPerUser}</div>
                  <div className="stat-label">Avg per User</div>
                </div>
              </div>
            </div>

            <div className="summary-card">
              <h3>Most Active Users</h3>
              <ul className="most-active-users">
                {userStats.slice(0, 5).map((user) => (
                  <li key={user.userId} className="user-item">
                    <span 
                      className="user-item-name"
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => setSelectedUser(user.userId)}
                    >
                      {user.userId.substring(0, 8)}...
                    </span>
                    <span className="user-item-count">{user.totalInteractions} interactions</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* User Dashboards */}
          {userStats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>No user data found. Make sure tables ending with &quot;_new_feed&quot; exist and contain data.</p>
            </div>
          ) : (
            userStats.map((user) => (
              <div key={user.userId} className="user-dashboard">
                <div className="user-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2>User: {user.userId.substring(0, 8)}...</h2>
                      <div className="user-id">{user.userId}</div>
                    </div>
                    {user.status === 'error' && (
                      <span className="status error" style={{ marginTop: 0 }}>
                        ✗ Error
                      </span>
                    )}
                    {user.status === 'success' && user.totalInteractions === 0 && (
                      <span className="status pending" style={{ marginTop: 0 }}>
                        ⚠ Empty Table
                      </span>
                    )}
                    {user.status === 'success' && user.totalInteractions > 0 && (
                      <span className="status success" style={{ marginTop: 0 }}>
                        ✓ Active
                      </span>
                    )}
                  </div>
                  {user.errorMessage && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.9rem' }}>
                      <strong>Error:</strong> {user.errorMessage}
                    </div>
                  )}
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{user.totalInteractions}</div>
                    <div className="stat-label">Total Interactions</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>
                      {user.firstActivity ? new Date(user.firstActivity).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="stat-label">First Activity</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>
                      {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="stat-label">Last Activity</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>
                      {Object.keys(user.actionBreakdown).length}
                    </div>
                    <div className="stat-label">Action Types</div>
                  </div>
                </div>

                {/* User Usage Chart */}
                {user.status === 'success' && user.totalInteractions > 0 && (
                  <UsageChart
                    data={user.allActivities}
                    title={`Usage Over Time - ${user.userId.substring(0, 8)}...`}
                    dateField="_createdDate"
                    showActionBreakdown={false}
                  />
                )}

                {user.status === 'success' && user.totalInteractions > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="action-breakdown">
                      <h3>Action Breakdown</h3>
                      {Object.keys(user.actionBreakdown).length === 0 ? (
                        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                          No action data available
                        </p>
                      ) : (
                        Object.entries(user.actionBreakdown)
                          .sort(([, a], [, b]) => b - a)
                          .map(([action, count]) => (
                            <div key={action} className="action-item">
                              <span 
                                className="action-badge"
                                style={{ backgroundColor: getActionColor(action) }}
                              >
                                {getActionDescription(action)}
                              </span>
                              <span className="action-count">{count}</span>
                            </div>
                          ))
                      )}
                    </div>

                  <div className="activity-timeline">
                    <h3>Recent Activity</h3>
                    {user.recentActivities.length === 0 ? (
                      <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                        No recent activity
                      </p>
                    ) : (
                      user.recentActivities.map((activity: any, idx: number) => (
                        <div key={idx} className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <div className="timeline-date">
                              {activity._createdDate || activity.created_at || activity._createddate || activity.createdDate || 'N/A'}
                            </div>
                            <div 
                              className="timeline-action"
                              style={{ color: getActionColor(activity.action || '') }}
                            >
                              {getActionDescription(activity.action || 'UNKNOWN')}
                            </div>
                            {activity.product_name && (
                              <div className="timeline-product">
                                Product: {activity.product_name}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    {user.status === 'error' ? (
                      <p>Unable to load data for this user. Check the error message above.</p>
                    ) : (
                      <p>This table exists but contains no data yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
