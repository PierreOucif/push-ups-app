"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlusCircle, Calendar, Activity } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type PushupEntry = {
  date: string
  count: number
  time: string
}

export function PushupTracker() {
  const [pushups, setPushups] = useState<number>(0)
  const [history, setHistory] = useState<PushupEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPushups()
  }, [])

  const fetchPushups = async () => {
    try {
      const response = await fetch('/api/pushups')
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error('Failed to fetch pushups:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pushups <= 0) return

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    const newEntry = { date: today, count: pushups, time }
    
    try {
      const response = await fetch('/api/pushups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      })
      
      const updatedHistory = await response.json()
      setHistory(updatedHistory)
      setPushups(0)
    } catch (error) {
      console.error('Failed to save pushup:', error)
    }
  }

  const todayCount = history.reduce((total, entry) => {
    if (entry.date === new Date().toISOString().split('T')[0]) {
      return total + entry.count
    }
    return total
  }, 0)

  const dailyGoal = 100
  const progress = Math.min((todayCount / dailyGoal) * 100, 100)

  const prepareLast30DaysData = () => {
    const data = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayTotal = history.reduce((sum, entry) => {
        return entry.date === dateStr ? sum + entry.count : sum
      }, 0)

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pushups: dayTotal
      })
    }

    console.log('History:', history) // Debug log
    console.log('Chart Data:', data) // Debug log
    return data
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="border-[#333] bg-black">
          <CardContent className="p-8">
            <div className="text-center text-zinc-400">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 space-y-3">
      <Card className="border-[#333] bg-black">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-[#0070f3]" />
            <CardTitle className="text-zinc-200 text-lg">Today&apos;s Progress</CardTitle>
          </div>
          <CardDescription className="text-zinc-400 text-sm">Track your daily pushup goal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-medium text-zinc-200">Progress to Goal</p>
                  <p className="text-sm text-zinc-400">{todayCount} / {dailyGoal}</p>
                </div>
                <Progress 
                  value={progress} 
                  className="mt-2 h-1 bg-zinc-800" 
                />
              </div>
              <div className="rounded-lg border border-[#333] bg-zinc-900 p-3">
                <div className="text-sm text-zinc-400">Total Pushups Today</div>
                <div className="mt-1 text-3xl font-bold tracking-tight text-zinc-200">
                  {todayCount}
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <Input
                type="number"
                min="1"
                value={pushups || ''}
                onChange={(e) => setPushups(parseInt(e.target.value) || 0)}
                placeholder="Enter pushup count"
                className="h-10 border-[#333] bg-zinc-900 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-[#0070f3]"
              />
              <Button 
                type="submit" 
                className="h-10 bg-[#0070f3] text-white hover:bg-[#0070f3]/90 active:scale-[0.98]"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Record
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#333] bg-black">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-[#0070f3]" />
            <CardTitle className="text-zinc-200 text-lg">30 Day Overview</CardTitle>
          </div>
          <CardDescription className="text-zinc-400 text-sm">Your pushup activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <BarChart 
                data={prepareLast30DaysData()}
                margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
              >
                <XAxis 
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={11}
                  interval={6}
                  tickMargin={5}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickMargin={5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="pushups"
                  fill="#0070f3"
                  minPointSize={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#333] bg-black">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-[#0070f3]" />
            <CardTitle className="text-zinc-200 text-lg">History</CardTitle>
          </div>
          <CardDescription className="text-zinc-400 text-sm">Your pushup records over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="rounded-lg border border-[#333] bg-zinc-900 p-6 text-center">
                <p className="text-sm text-zinc-400">No pushups recorded yet. Start your journey!</p>
              </div>
            ) : (
              history.slice().reverse().map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-[#333] bg-zinc-900 p-3 transition-all hover:bg-zinc-800"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-zinc-200">
                      {`${new Date(entry.date).toLocaleDateString()} ${entry.time}`}
                    </span>
                  </div>
                  <span className="font-medium text-zinc-200">
                    {entry.count} pushups
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 