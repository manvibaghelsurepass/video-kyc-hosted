import { useState, useEffect, useRef } from "react"
import { Button } from "/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "/src/components/ui/card"
import { Calendar } from "/src/components/ui/calendar"
import { ChevronLeft, Clock, CheckCircle, CalendarCheck, X } from "lucide-react"
import { format, addDays, setHours, setMinutes, addMinutes, isBefore, isEqual, startOfDay, isAfter } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "/src/components/ui/popover"
import { ScrollArea } from "/src/components/ui/scroll-area"
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
} from "/src/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "/src/components/ui/alert"
import { useNavigate } from "react-router-dom"
import surepassLogo from '/src/assets/surepassLogo.png'
import darkSPLogo from '/src/assets/White-Surepass-Logo.png'
import { useSelector } from "react-redux"
export default function SchedulerSlot() {
      const navigate = useNavigate()
      const [date, setDate] = useState(addDays(new Date(), 1))
      const [selectedTime, setSelectedTime] = useState(undefined)
      const [availableTimes, setAvailableTimes] = useState([])
      const [bookedTimes, setBookedTimes] = useState([])
      const [dropdownWidth, setDropdownWidth] = useState(0)
      const [showSuccessDialog, setShowSuccessDialog] = useState(false)
      const [showConfirmation, setShowConfirmation] = useState(false)
      const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false)
      const selectRef = useRef(null)
      const { theme } = useSelector(state => state.appSlice);

      const bookedSlots = [
            { date: addDays(startOfDay(new Date()), 1), time: "10:00 - 10:15" },
            { date: addDays(startOfDay(new Date()), 1), time: "11:30 - 11:45" },
            { date: addDays(startOfDay(new Date()), 1), time: "14:30 - 14:45" },
            { date: addDays(startOfDay(new Date()), 1), time: "16:00 - 16:15" },
            { date: addDays(startOfDay(new Date()), 2), time: "09:30 - 09:45" },
            { date: addDays(startOfDay(new Date()), 2), time: "11:00 - 11:15" },
            { date: addDays(startOfDay(new Date()), 2), time: "15:30 - 15:45" },
            { date: addDays(startOfDay(new Date()), 3), time: "09:30 - 09:45" },
            { date: addDays(startOfDay(new Date()), 3), time: "13:00 - 13:15" },
            { date: addDays(startOfDay(new Date()), 3), time: "16:30 - 16:45" },
      ]

      useEffect(() => {
            if (date) {
                  const times = []
                  const booked = []
                  const currentDate = new Date()
                  for (let i = 9; i < 17; i++) {
                        for (let j = 0; j < 60; j += 15) {
                              const startTime = setMinutes(setHours(date, i), j)
                              const endTime = addMinutes(startTime, 15)
                              if (isBefore(currentDate, startTime) && endTime.getHours() < 17) {
                                    // Skip slots between 2 PM and 3 PM
                                    if (startTime.getHours() === 14 || (startTime.getHours() === 13 && startTime.getMinutes() >= 45)) {
                                          continue
                                    }
                                    const timeString = `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`
                                    if (isSlotBooked(date, timeString)) {
                                          booked.push(timeString)
                                    } else {
                                          times.push(timeString)
                                    }
                              }
                        }
                  }
                  setAvailableTimes(times)
                  setBookedTimes(booked)
                  setSelectedTime(undefined)
            }
      }, [date])

      useEffect(() => {
            if (selectRef.current) {
                  const resizeObserver = new ResizeObserver(entries => {
                        for (let entry of entries) {
                              setDropdownWidth(entry.contentRect.width)
                        }
                  })

                  resizeObserver.observe(selectRef.current)

                  return () => {
                        resizeObserver.disconnect()
                  }
            }
      }, [])

      useEffect(() => {
            let timeoutId
            if (showConfirmation) {
                  timeoutId = setTimeout(() => {
                        navigate('/')
                  }, 1000)
            }
            return () => {
                  if (timeoutId) {
                        clearTimeout(timeoutId)
                  }
            }
      }, [showConfirmation, navigate])

      const isSlotBooked = (date, time) => {
            return bookedSlots.some(slot =>
                  isEqual(startOfDay(slot.date), startOfDay(date)) && slot.time === time
            )
      }

      const handleScheduleAppointment = () => {
            setShowSuccessDialog(true)
      }

      const handleCloseDialog = () => {
            setShowSuccessDialog(false)
            setShowConfirmation(true)
      }

      const handleTimeSelection = (time) => {
            setSelectedTime(time)
            setIsTimePopoverOpen(false)
      }

      return (
            <div className="flex flex-col h-dvh bg-background text-foreground">

                  <header className="bg-background p-3 shadow flex justify-start  top-0 z-10">
                        <section className="flex gap-2 items-center">
                              <Button variant="outline" onClick={() => {
                                    navigate('/joining')
                              }} className={'bg-secondary text-secondary-foreground'} size="icon">
                                    <ChevronLeft className="h-6 w-6" />
                              </Button>
                              <img src={theme === 'dark' ? darkSPLogo : surepassLogo} alt="" className={'h-7'} />
                        </section>

                  </header>

                  <main className="flex-1 overflow-y-auto p-4 space-y-4">
                        {showConfirmation && (
                              <Alert className="mb-4">
                                    <CalendarCheck className="h-4 w-4" />
                                    <AlertTitle>Appointment Confirmed</AlertTitle>
                                    <AlertDescription>
                                          Your slot is booked for {date && format(date, 'MMMM d, yyyy')} at {selectedTime}.
                                          Redirecting to home page...
                                    </AlertDescription>
                              </Alert>
                        )}

                        <h1 className="text-lg font-semibold">Schedule Your Slot</h1>
                        <Card className="border border-border shadow-lg">
                              <CardContent className="p-4">
                                    <Calendar
                                          mode="single"
                                          selected={date}
                                          onSelect={setDate}
                                          disabled={(date) => date < new Date()}
                                          className="rounded-md mx-auto"
                                    />
                              </CardContent>
                        </Card>

                        <Card className="border border-border shadow-lg">
                              <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Select Time</CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                    <Popover open={isTimePopoverOpen} onOpenChange={setIsTimePopoverOpen}>
                                          <PopoverTrigger asChild>
                                                <Button
                                                      ref={selectRef}
                                                      variant="outline"
                                                      className={`w-full justify-start text-left font-normal ${!selectedTime && "text-muted-foreground"}`}
                                                >
                                                      <Clock className="mr-2 h-4 w-4" />
                                                      {selectedTime ? selectedTime : "Choose a time slot"}
                                                </Button>
                                          </PopoverTrigger>
                                          <PopoverContent
                                                className="p-0"
                                                align="start"
                                                side="bottom"
                                                style={{ width: `${dropdownWidth}px` }}
                                          >
                                                <ScrollArea className="h-[300px]">
                                                      <div className="grid grid-cols-2 gap-2 p-2">
                                                            {availableTimes.map((time) => (
                                                                  <Card
                                                                        key={time}
                                                                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                                                                        onClick={() => handleTimeSelection(time)}
                                                                  >
                                                                        <CardContent className="p-2 text-center">
                                                                              {time}
                                                                        </CardContent>
                                                                  </Card>
                                                            ))}
                                                            {bookedTimes.map((time) => (
                                                                  <Card
                                                                        key={time}
                                                                        className="cursor-not-allowed bg-muted"
                                                                  >
                                                                        <CardContent className="p-2 text-center flex items-center justify-between">
                                                                              <span className="text-muted-foreground">{time}</span>
                                                                              <X className="h-4 w-4 text-muted-foreground" />
                                                                        </CardContent>
                                                                  </Card>
                                                            ))}
                                                            <Card className="col-span-2 cursor-not-allowed bg-muted">
                                                                  <CardContent className="p-2 text-center text-muted-foreground">
                                                                        Lunch Break (2:00 PM - 3:00 PM)
                                                                  </CardContent>
                                                            </Card>
                                                      </div>
                                                </ScrollArea>
                                          </PopoverContent>
                                    </Popover>
                              </CardContent>
                        </Card>

                        <Card className="border border-border shadow-lg">
                              <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Video KYC Appointment</CardTitle>
                              </CardHeader>
                              <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                          Schedule your Video KYC appointment for a future date and time.
                                          Choose a convenient 15-minute slot for your verification process.
                                    </p>
                                    <Button
                                          className="w-full"
                                          disabled={!selectedTime}
                                          onClick={handleScheduleAppointment}
                                    >
                                          Schedule Appointment
                                    </Button>
                              </CardContent>
                        </Card>
                  </main>

                  <Dialog open={showSuccessDialog} onOpenChange={(open) => {
                        if (!open) {
                              handleCloseDialog()
                        }
                  }}>
                        <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                    <DialogTitle className="flex items-center">
                                          <CheckCircle className="mr-2 h-6 w-6 text-primary" />
                                          Appointment Scheduled
                                    </DialogTitle>
                                    <DialogDescription>
                                          Your Video KYC appointment has been successfully scheduled for {date && format(date, 'MMMM d, yyyy')} at {selectedTime}.
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4">
                                    <Button className="w-full" onClick={handleCloseDialog}>
                                          Close
                                    </Button>
                              </div>
                        </DialogContent>
                  </Dialog>
            </div>
      )
}
