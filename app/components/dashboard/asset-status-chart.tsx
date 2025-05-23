"use client"

import { useEffect, useRef } from "react"
import { BarChart, Battery, CheckCircle, Clock } from "lucide-react"

export function AssetStatusChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Chart configuration
    const chartWidth = rect.width
    const chartHeight = rect.height
    const barWidth = chartWidth / 6
    const maxBarHeight = chartHeight - 60
    const padding = 40

    // Data for the chart
    const data = [
      { label: "In Use", value: 842, color: "#22c55e", icon: CheckCircle },
      { label: "In Storage", value: 256, color: "#3b82f6", icon: Battery },
      { label: "In Transit", value: 64, color: "#f59e0b", icon: Clock },
      { label: "Maintenance", value: 86, color: "#8b5cf6", icon: BarChart },
    ]

    // Find the maximum value for scaling
    const maxValue = Math.max(...data.map((item) => item.value))

    // Draw the bars
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * maxBarHeight
      const x = padding + index * (barWidth + 20)
      const y = chartHeight - barHeight - 30

      // Draw bar
      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 6)
      ctx.fill()

      // Draw value on top of bar
      ctx.fillStyle = "#000"
      ctx.font = "bold 14px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 10)

      // Draw label below bar
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.label, x + barWidth / 2, chartHeight - 10)
    })
  }, [])

  return (
    <div className="h-[300px] w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

