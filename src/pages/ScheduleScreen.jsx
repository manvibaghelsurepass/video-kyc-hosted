import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addMinutes, parse, isSameDay, startOfWeek, addDays, isToday, addWeeks, subWeeks } from 'date-fns'
import { Calendar } from "/src/components/ui/calendar"
import { Button } from "/src/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "/src/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "/src/components/ui/tabs"
import { ScrollArea } from "/src/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/src/components/ui/select"
import { Input } from "/src/components/ui/input"
import { Label } from "/src/components/ui/label"
import { Switch } from "/src/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/src/components/ui/card"
import { Progress } from "/src/components/ui/progress"
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, X, Filter, Calendar as CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react'
import { useToast } from "/src/components/ui/use-toast"

const generateTimeSlots = (date) => {
  const slots = []
  let current = new Date(date.setHours(9, 0, 0, 0))
  const end = new Date(date.setHours(17, 0, 0, 0))

  while (current < end) {
    slots.push({
      id: `${date.toISOString()}-${format(current, 'HHmm')}`,
      start: current,
      end: addMinutes(current, 15),
      available: Math.floor(Math.random() * 16) + 1,
      booked: false,
      selected: false,
    })
    current = addMinutes(current, 15)
  }

  return slots
}

const TimeSlot = ({ slot, onSelect }) => {
  const startTime = format(slot.start, 'HH:mm')
  const endTime = format(slot.end, 'HH:mm')

  return (
    <motion.div
      className={`p-3 border border-b-4 border-green-500 rounded-md ${slot.booked ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'} ${slot.selected ? 'ring-1 ring-green-500' : ''} relative transition-all`}
      onClick={slot.booked ? undefined : onSelect}
      whileHover={slot.booked ? {} : { scale: 1.02 }}
      whileTap={slot.booked ? {} : { scale: 0.98 }}
    >
      <div className="text-sm font-medium">{startTime} - {endTime}</div>
      {slot.selected && (
        <motion.div
          className="absolute top-1 right-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </motion.div>
      )}
    </motion.div>
  )
}

const WeekView = ({ startDate, onDateSelect, selectedDate }) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDays.map((day, index) => (
        <Button
          key={index}
          variant={isSameDay(day, selectedDate) ? "default" : "outline"}
          className={`flex-col items-center justify-center h-14 ${isToday(day) ? 'border-primary' : ''} ${isSameDay(day, selectedDate) ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => onDateSelect(day)}
        >
          <div className="text-xs font-medium">{format(day, 'EEE')}</div>
          <div className="text-sm">{format(day, 'd')}</div>
        </Button>
      ))}
    </div>
  )
}

const MobileStepper = ({ step, setStep, date, setDate, timeFilter, setTimeFilter, searchQuery, setSearchQuery, showOnlyAvailable, setShowOnlyAvailable, groupedSlots, handleSlotSelect }) => {
  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="space-y-4">
      <Progress value={(step / 2) * 100} className="w-full" />
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={prevStep} disabled={step === 1}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <span className="font-medium">Step {step} of 2</span>
        <Button variant="outline" onClick={nextStep} disabled={step === 2}>
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Set Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-time-filter">Time of day</Label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger id="mobile-time-filter">
                    <SelectValue placeholder="Select time of day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Times</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-search-time">Search time</Label>
                <Input
                  id="mobile-search-time"
                  type="text"
                  placeholder="Search time..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mobile-show-available"
                  checked={showOnlyAvailable}
                  onCheckedChange={setShowOnlyAvailable}
                />
                <Label htmlFor="mobile-show-available">Show only available slots</Label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Available Slots</CardTitle>
              <CardDescription>{format(date, 'EEEE, MMMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[50vh]">
                {Object.keys(groupedSlots).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>No slots available for the selected filters.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedSlots).map(([hour, hourSlots]) => (
                      <div key={hour}>
                        <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-background py-2 z-10 flex items-center">
                          {format(parse(hour, 'HH', new Date()), 'h a')}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {hourSlots.map((slot) => (
                            <TimeSlot
                              key={slot.id}
                              slot={slot}
                              onSelect={() => handleSlotSelect(slot)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function ScheduleScreen() {
  const [date, setDate] = useState(new Date())
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date()))
  const [slots, setSlots] = useState(generateTimeSlots(date))
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [view, setView] = useState('week')
  const [timeFilter, setTimeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [step, setStep] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    setSlots(generateTimeSlots(date))
    setSelectedSlot(null)
  }, [date])

  const handleDateChange = useCallback((newDate) => {
    if (newDate) {
      setDate(newDate)
      setWeekStartDate(startOfWeek(newDate))
    }
  }, [])

  const handleSlotSelect = useCallback((slot) => {
    if (!slot.booked) {
      setSelectedSlot(slot.selected ? null : slot)
      setSlots(slots => slots.map(s => ({
        ...s,
        selected: s.id === slot.id ? !s.selected : false
      })))
    }
  }, [])

  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      const hour = slot.start.getHours()
      const matchesTimeFilter =
        (timeFilter === 'morning' && hour < 12) ||
        (timeFilter === 'afternoon' && hour >= 12) ||
        timeFilter === 'all'
      const matchesSearch = searchQuery === '' ||
        format(slot.start, 'HH:mm').includes(searchQuery)
      const matchesAvailability = !showOnlyAvailable || (!slot.booked && slot.available > 0)
      return matchesTimeFilter && matchesSearch && matchesAvailability
    })
  }, [slots, timeFilter, searchQuery, showOnlyAvailable])

  const groupSlotsByHour = useCallback(() => {
    const grouped = {}
    filteredSlots.forEach(slot => {
      const hour = format(slot.start, 'HH')
      if (!grouped[hour]) {
        grouped[hour] = []
      }
      grouped[hour].push(slot)
    })
    return grouped
  }, [filteredSlots])

  const groupedSlots = useMemo(() => groupSlotsByHour(), [groupSlotsByHour])

  const nextWeek = useCallback(() => {
    setWeekStartDate(addWeeks(weekStartDate, 1))
    setDate(addWeeks(date, 1))
  }, [weekStartDate, date])

  const prevWeek = useCallback(() => {
    setWeekStartDate(subWeeks(weekStartDate, 1))
    setDate(subWeeks(date, 1))
  }, [weekStartDate, date])

  const handleScheduleMeeting = useCallback(() => {
    if (selectedSlot) {
      toast({
        title: "Meeting Scheduled",
        description: `Your meeting is scheduled for ${format(selectedSlot.start, 'EEEE, MMMM d, yyyy')} at ${format(selectedSlot.start, 'h:mm a')}.`,
      })
      setName('')
      setEmail('')
      setSelectedSlot(null)
    }
  }, [selectedSlot, toast])

  return (
    <div className="min-h-screen   lg:p-8">
      <Card className="rounded-lg border-none bg-card text-card-foreground shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2" />
            Advanced Slot Booking
          </CardTitle>
          <CardDescription>Select a date and time for your appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1 space-y-6 lg:block hidden">
              <Tabs value={view} onValueChange={(v) => setView(v)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
                <TabsContent value="week" className="mt-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {format(weekStartDate, 'MMMM yyyy')}
                      </CardTitle>
                      <div className="space-x-2">
                        <Button variant="outline" size="icon" onClick={prevWeek}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextWeek}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <WeekView startDate={weekStartDate} onDateSelect={handleDateChange} selectedDate={date} />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="month">
                  <Card>
                    <CardContent className="pt-6">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        className="h-full w-full flex"
                        classNames={{
                          months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                          month: "space-y-4 w-full flex flex-col",
                          table: "w-full h-full border-collapse space-y-1",
                          head_row: "",
                          row: "w-full mt-2",
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-filter">Time of day</Label>
                    <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value)}>
                      <SelectTrigger id="time-filter">
                        <SelectValue placeholder="Select time of day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Times</SelectItem>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-time">Search time</Label>
                    <Input
                      id="search-time"
                      type="text"
                      placeholder="Search time..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-available"
                      checked={showOnlyAvailable}
                      onCheckedChange={setShowOnlyAvailable}
                    />
                    <Label htmlFor="show-available">Show only available slots</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 lg:block hidden">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Clock className="w-5 h-5 mr-2" />
                    Available Slots
                  </CardTitle>
                  <CardDescription>
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    {Object.keys(groupedSlots).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p>No slots available for the selected filters.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 p-6">
                        {Object.entries(groupedSlots).map(([hour, hourSlots]) => (
                          <div key={hour}>
                            <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-background py-2 z-10 flex items-center">
                              {format(parse(hour, 'HH', new Date()), 'h a')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {hourSlots.map((slot) => (
                                <TimeSlot
                                  key={slot.id}
                                  slot={slot}
                                  onSelect={() => handleSlotSelect(slot)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            <div className="lg:hidden">
              <MobileStepper
                step={step}
                setStep={setStep}
                date={date}
                setDate={setDate}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showOnlyAvailable={showOnlyAvailable}
                setShowOnlyAvailable={setShowOnlyAvailable}
                groupedSlots={groupedSlots}
                handleSlotSelect={handleSlotSelect}
              />
            </div>
          </div>
        </CardContent>
        <CardContent className="flex justify-end pt-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="ml-auto" disabled={!selectedSlot}>
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Your Meeting</DialogTitle>
                <DialogDescription>
                  {selectedSlot && (
                    <>
                      You're about to schedule a meeting on {format(selectedSlot.start, 'EEEE, MMMM d, yyyy')} at {format(selectedSlot.start, 'h:mm a')}.
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast({ title: "Booking cancelled" })}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={handleScheduleMeeting}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
