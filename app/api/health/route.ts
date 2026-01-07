import { NextResponse } from 'next/server'

// Force Node.js runtime and dynamic rendering (prevent static prerendering)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Dashboard API is running',
    timestamp: new Date().toISOString()
  })
}

