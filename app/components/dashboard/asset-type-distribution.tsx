"use client"

import { useEffect, useRef } from "react"

export function AssetTypeDistribution() {
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
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Data for the pie chart
    const data = [
      { label: "IT Equipment", value: 35, color: "#3b82f6" },
      { label: "Machinery", value: 25, color: "#8b5cf6" },
      { label: "Vehicles", value: 15, color: "#22c55e" },
      { label: "Office Equipment", value: 10, color: "#f59e0b" },
      { label: "Tools", value: 8, color: "#ef4444" },
      { label: "Other", value: 7, color: "#6b7280" },
    ]

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0)

    // Draw the pie chart
    let startAngle = 0
    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()

      // Calculate position for the label
      const middleAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + labelRadius * Math.cos(middleAngle)
      const labelY = centerY + labelRadius * Math.sin(middleAngle)

      // Draw percentage label
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${Math.round((item.value / total) * 100)}%`, labelX, labelY)

      startAngle += sliceAngle
    })

    // Draw legend
    const legendX = 10
    let legendY = rect.height - data.length * 20 - 10

    data.forEach((item) => {
      // Draw color box
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY, 12, 12)

      // Draw label
      ctx.fillStyle = "#fff"
      ctx.font = "12px Inter, system-ui, sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(item.label, legendX + 20, legendY + 6)

      legendY += 20
    })
  }, [])

  return (
    <div className="h-[300px] w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

