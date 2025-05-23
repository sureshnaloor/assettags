"use client"

import { CalendarClock, CheckCircle, Clock, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"

export function MaintenanceSchedule() {
  // Sample data for maintenance schedule
  const maintenanceItems = [
    {
      id: 1,
      asset: "CNC Machine #3",
      type: "Preventive",
      date: "Today",
      time: "2:00 PM",
      status: "scheduled",
      technician: "Engineering Team",
    },
    {
      id: 2,
      asset: "Forklift #2",
      type: "Inspection",
      date: "Tomorrow",
      time: "9:30 AM",
      status: "scheduled",
      technician: "Safety Inspector",
    },
    {
      id: 3,
      asset: "Server Rack A",
      type: "Preventive",
      date: "Mar 18, 2025",
      time: "11:00 AM",
      status: "scheduled",
      technician: "IT Support",
    },
    {
      id: 4,
      asset: "HVAC System",
      type: "Repair",
      date: "Mar 19, 2025",
      time: "3:30 PM",
      status: "pending",
      technician: "HVAC Contractor",
    },
    {
      id: 5,
      asset: "Security Cameras",
      type: "Upgrade",
      date: "Mar 20, 2025",
      time: "10:00 AM",
      status: "pending",
      technician: "Security Team",
    },
  ]

  // Function to get the appropriate icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "scheduled":
        return <CalendarClock className="h-4 w-4 text-blue-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <Wrench className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {maintenanceItems.map((item) => (
        <div key={item.id} className="flex items-start gap-4 rounded-lg border p-3">
          <div className="rounded-full bg-muted p-2">{getStatusIcon(item.status)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{item.asset}</p>
              <span className="text-xs text-muted-foreground">
                {item.date}, {item.time}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {item.type} maintenance - {item.technician}
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            Details
          </Button>
        </div>
      ))}
    </div>
  )
}

