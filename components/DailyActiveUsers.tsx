'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import {
  groupActivitiesByDate,
  getTimeRangeLabel,
  formatDateForDisplay,
  getDateKey,
  type TimeRange
} from '@/lib/chartUtils'

interface DailyActiveUsersProps {
  userStats: Array<{
    userId: string
    allActivities: any[]
    status: 'success' | 'pending' | 'error'
  }>
}

export default function DailyActiveUsers({ userStats }: DailyActiveUsersProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const timeRanges: TimeRange[] = ['week', 'month', '3months', '6months', 'year', 'all']
  
  // Calculate daily active users
  const dailyActiveUsers = useMemo(() => {
    const dateUserMap = new Map<string, Set<string>>()
    
    // Collect all activities from all users
    userStats.forEach(user => {
      if (user.status === 'success' && user.allActivities) {
        user.allActivities.forEach(activity => {
          // Try multiple possible date field names
          const dateValue = activity._createdDate || activity.created_at || activity._createddate || activity.createdDate
          if (dateValue) {
            try {
              const dateKey = getDateKey(dateValue)
              if (!dateUserMap.has(dateKey)) {
                dateUserMap.set(dateKey, new Set())
              }
              dateUserMap.get(dateKey)!.add(user.userId)
            } catch (e) {
              console.warn(`[DAU] Invalid date value for user ${user.userId}:`, dateValue)
            }
          }
        })
      }
    })
    
    // Convert to array and filter by time range
    const startDate = new Date()
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case 'all':
        startDate.setTime(0)
        break
    }
    
    const result = Array.from(dateUserMap.entries())
      .filter(([dateKey]) => {
        const date = new Date(dateKey)
        return date >= startDate
      })
      .map(([date, users]) => ({
        date,
        activeUsers: users.size,
        totalUsers: userStats.filter(u => u.status === 'success').length
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    return result
  }, [userStats, timeRange])
  
  // Calculate average DAU
  const avgDAU = dailyActiveUsers.length > 0
    ? Math.round(dailyActiveUsers.reduce((sum, day) => sum + day.activeUsers, 0) / dailyActiveUsers.length)
    : 0
  
  // Get max DAU for color scaling
  const maxDAU = dailyActiveUsers.length > 0
    ? Math.max(...dailyActiveUsers.map(d => d.activeUsers))
    : 0
  
  // Color function - gradient from bright cyan to dark navy based on activity
  const getColor = (activeUsers: number) => {
    if (maxDAU === 0) return '#e0e0e0'
    const intensity = activeUsers / maxDAU
    // Gradient from bright cyan (#00d4ff) to dark navy (#001122)
    // Cyan: rgb(0, 212, 255) -> Navy: rgb(0, 17, 34)
    const r = 0 // Red stays at 0
    const g = Math.round(212 - (195 * (1 - intensity))) // 212 -> 17
    const b = Math.round(255 - (233 * (1 - intensity))) // 255 -> 34
    return `rgb(${r}, ${g}, ${b})`
  }
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', color: '#333', margin: '0 0 0.5rem 0' }}>
            Daily Active Users (DAU)
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
            Number of unique users active each day
          </p>
        </div>
        
        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {timeRanges.map(range => (
            <option key={range} value={range}>
              {getTimeRangeLabel(range)}
            </option>
          ))}
        </select>
      </div>
      
      {dailyActiveUsers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#666' 
        }}>
          No user activity data for the selected time range
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                Average DAU
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0099cc' }}>
                {avgDAU}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                Peak DAU
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0099cc' }}>
                {maxDAU}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                Total Users
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0099cc' }}>
                {userStats.filter(u => u.status === 'success').length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                Days Tracked
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0099cc' }}>
                {dailyActiveUsers.length}
              </div>
            </div>
          </div>
          
          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDateForDisplay(value)}
                stroke="#666"
                style={{ fontSize: '0.85rem' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '0.85rem' }}
                label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(value) => formatDateForDisplay(value)}
                formatter={(value: number | undefined) => [`${value || 0} users`, 'Active Users']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '0.5rem'
                }}
              />
              <Legend />
              <Bar 
                dataKey="activeUsers" 
                name="Daily Active Users"
                radius={[4, 4, 0, 0]}
              >
                {dailyActiveUsers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.activeUsers)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Activity Percentage */}
          {dailyActiveUsers.length > 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f0f4ff',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#333'
            }}>
              <strong>Engagement Rate:</strong> On average,{' '}
              {userStats.filter(u => u.status === 'success').length > 0
                ? Math.round((avgDAU / userStats.filter(u => u.status === 'success').length) * 100)
                : 0}% of users are active daily
            </div>
          )}
        </>
      )}
    </div>
  )
}

