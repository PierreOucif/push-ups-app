import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data', 'pushups.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir)
  }
}

export async function GET() {
  try {
    await ensureDataDirectory()
    try {
      const data = await fs.readFile(dataFilePath, 'utf8')
      return NextResponse.json(JSON.parse(data))
    } catch (error) {
      // If file doesn't exist, return empty array
      await fs.writeFile(dataFilePath, JSON.stringify([]))
      return NextResponse.json([])
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read pushups data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureDataDirectory()
    const newEntry = await request.json()
    
    let history = []
    try {
      const data = await fs.readFile(dataFilePath, 'utf8')
      history = JSON.parse(data)
    } catch {
      // If file doesn't exist, start with empty array
    }
    
    history.push(newEntry)
    await fs.writeFile(dataFilePath, JSON.stringify(history))
    
    return NextResponse.json(history)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save pushup' }, { status: 500 })
  }
} 