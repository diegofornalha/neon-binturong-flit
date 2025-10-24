"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

interface FiltersProps {
  onFilterChange: (filters: any) => void
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [client, setClient] = useState<string>("")
  const [platform, setPlatform] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const handleApplyFilters = () => {
    console.log("[Filters] Applying filters:", { client, platform, dateRange })
    onFilterChange({
      client,
      platform,
      dateRange,
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="client">Client</Label>
        <Select value={client} onValueChange={setClient}>
          <SelectTrigger>
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client1">Acme Corporation</SelectItem>
            <SelectItem value="client2">Globex Inc</SelectItem>
            <SelectItem value="client3">TechCorp Ltd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="platform">Platform</Label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label>Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-end">
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  )
}