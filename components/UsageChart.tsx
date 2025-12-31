'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  groupActivitiesByDate,
  getTimeRangeLabel,
  formatDateForDisplay,
  type TimeRange
} from '@/lib/chartUtils'
import { getActionColor, getActionDescription } from '@/lib/utils'

interface UsageChartProps {
  data: any[]
  title: string
  dateField?: string
  showActionBreakdown?: boolean
}

export default function UsageChart({ 
  data, 
  title, 
  dateField = '_createdDate',
  showActionBreakdown = false 
}: UsageChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  
  const timeRanges: TimeRange[] = ['week', 'month', '3months', '6months', 'year', 'all']
  
  // Process data for the selected time range
  const chartData = groupActivitiesByDate(data, dateField, timeRange)
  
  // Get all unique actions for breakdown
  const allActions = new Set<string>()
  chartData.forEach(day => {
    Object.keys(day.actions).forEach(action => allActions.add(action))
  })
  
  // Transform data for charts - flatten action breakdown into separate fields
  const transformedData = chartData.map(day => {
    const dayData: any = {
      date: day.date,
      count: day.count
    }
    // Add each action as a separate field
    Array.from(allActions).forEach(action => {
      dayData[action] = day.actions[action] || 0
    })
    return dayData
  })
  
  const ChartComponent = chartType === 'line' ? LineChart : BarChart
  
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
        <h3 style={{ fontSize: '1.3rem', color: '#333', margin: 0 }}>{title}</h3>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Chart Type Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setChartType('line')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: chartType === 'line' ? '#0099cc' : 'white',
                color: chartType === 'line' ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: chartType === 'bar' ? '#0099cc' : 'white',
                color: chartType === 'bar' ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Bar
            </button>
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
              cursor: 'pointer'
            }}
          >
            {timeRanges.map(range => (
              <option key={range} value={range}>
                {getTimeRangeLabel(range)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#666' 
        }}>
          No activity data for the selected time range
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <ChartComponent data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDateForDisplay(value)}
                stroke="#666"
                style={{ fontSize: '0.85rem' }}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '0.85rem' }}
              />
              <Tooltip 
                labelFormatter={(value) => formatDateForDisplay(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '0.5rem'
                }}
              />
              <Legend />
              
              {showActionBreakdown ? (
                // Show breakdown by action type
                Array.from(allActions).map(action => 
                  chartType === 'line' ? (
                    <Line
                      key={action}
                      type="monotone"
                      dataKey={action}
                      name={getActionDescription(action)}
                      stroke={getActionColor(action)}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ) : (
                    <Bar
                      key={action}
                      dataKey={action}
                      name={getActionDescription(action)}
                      fill={getActionColor(action)}
                    />
                  )
                )
              ) : (
                // Show total count
                chartType === 'line' ? (
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Total Actions"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ) : (
                  <Bar
                    dataKey="count"
                    name="Total Actions"
                    fill="#00d4ff"
                  />
                )
              )}
            </ChartComponent>
          </ResponsiveContainer>
          
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e0e0e0'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                Total Actions
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0099cc' }}>
                {chartData.reduce((sum, day) => sum + day.count, 0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                Days Active
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0099cc' }}>
                {chartData.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                Avg per Day
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0099cc' }}>
                {chartData.length > 0 
                  ? Math.round(chartData.reduce((sum, day) => sum + day.count, 0) / chartData.length)
                  : 0}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

