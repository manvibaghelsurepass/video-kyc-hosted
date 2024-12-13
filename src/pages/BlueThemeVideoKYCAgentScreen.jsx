import React, { useState, useEffect } from "react"
import { Button } from "/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "/src/components/ui/card"
import { Input } from "/src/components/ui/input"
import { Label } from "/src/components/ui/label"
import { Badge } from "/src/components/ui/badge"
import { ScrollArea } from "/src/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "/src/components/ui/sheet"
import { Mic, MicOff, Camera, CameraOff, PhoneOff, RotateCcw, Video, CheckCircle2, AlertCircle, User, MessageSquare, Send, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Controls } from "./MeetingView"
import { motion, AnimatePresence } from "framer-motion"

const steps = [
  { id: 'liveness', title: 'Liveness Check', icon: User },
  { id: 'document', title: 'Document Verification', icon: Camera },
  { id: 'questions', title: 'Security Questions', icon: AlertCircle },
  { id: 'review', title: 'Final Review', icon: CheckCircle2 }
]

export default function WhiteThemeVideoKYCAgentScreen() {
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [recording, setRecording] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [sessionTime, setSessionTime] = useState(0);


  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prevTime => prevTime + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Main content area */}
      <div className="w-[60%] flex flex-col p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Video KYC Session</h1>
            <p className="text-sm text-gray-600">Agent: John Doe</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs py-1 px-3 rounded-full">Live</Badge>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{formatTime(sessionTime)}</span>
            </div>
          </div>
        </header>

        {/* Video call area */}
        <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-lg relative">
          {/* Main video (user) */}
          <video className="w-full h-full object-cover" src="/placeholder.svg" />

          {/* Agent video (small overlay) */}
          <motion.div
            className="absolute top-4 right-4 w-40 h-30 bg-gray-200 rounded-lg overflow-hidden shadow-md border-2 border-gray-300"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <video className="w-full h-full object-cover" src="/placeholder.svg" />
          </motion.div>

          {/* User info overlay */}
          <motion.div
            className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-800">Jane Smith</h3>
                <p className="text-xs text-gray-600">ID: KYC-12345</p>
              </div>
            </div>
          </motion.div>

          {/* Control buttons */}
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-white bg-opacity-90 px-4 py-3 rounded-full shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button
              variant={micOn ? "outline" : "destructive"}
              size="icon"
              onClick={() => setMicOn(!micOn)}
              className="w-10 h-10 border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button
              variant={cameraOn ? "outline" : "destructive"}
              size="icon"
              onClick={() => setCameraOn(!cameraOn)}
              className="w-10 h-10 border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              {cameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
            </Button>
            <Button
              variant={recording ? "destructive" : "outline"}
              size="icon"
              onClick={() => setRecording(!recording)}
              className="w-10 h-10 border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="destructive" size="icon" className="w-10 h-10">
              <PhoneOff className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="w-10 h-10 border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors duration-200">
              <RotateCcw className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Side panel for user identification */}
      <div className="w-[40%] bg-white p-6 flex flex-col shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">User Identification</h2>
          <div className="flex items-center justify-between mb-4">
            <Button onClick={handlePrevStep} disabled={currentStep === 0} size="sm" className="bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200">
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm font-medium text-gray-600">{currentStep + 1} of {steps.length}</span>
            <Button onClick={handleNextStep} disabled={currentStep === steps.length - 1} size="sm" className="bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {/* Progress bar */}
          <div className="flex w-full mb-6 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <ScrollArea className="flex-1 pr-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {steps.map((step, index) => (
                <Card key={step.id} className={`border shadow-md ${index === currentStep ? 'bg-gray-50' : 'bg-white'}`}>
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center text-base text-gray-800">
                      {React.createElement(step.icon, { className: "h-5 w-5 text-gray-600 mr-3" })}
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  {index === currentStep && (
                    <CardContent className="p-4">
                      {step.id === 'liveness' && (
                        <div className="space-y-4">
                          <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                            <img src="/placeholder.svg" alt="Liveness Check" className="w-full h-full object-cover" />
                          </div>
                          <Button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">Verify Liveness</Button>
                        </div>
                      )}
                      {step.id === 'document' && (
                        <div className="space-y-4">
                          <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                            <img src="/placeholder.svg" alt="Document Capture" className="w-full h-full object-cover" />
                          </div>
                          <Button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">Capture Document</Button>
                        </div>
                      )}
                      {step.id === 'questions' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="dob" className="text-sm text-gray-700">Date of Birth</Label>
                            <Input id="dob" placeholder="DD/MM/YYYY" className="text-sm py-2 bg-white border-gray-300 text-gray-800 focus:ring-blue-500" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mothers-name" className="text-sm text-gray-700">Mother's Maiden Name</Label>
                            <Input id="mothers-name" placeholder="Enter answer" className="text-sm py-2 bg-white border-gray-300 text-gray-800 focus:ring-blue-500" />
                          </div>
                          <Button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">Submit Answers</Button>
                        </div>
                      )}
                      {step.id === 'review' && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-700">Please review all the information before final submission.</p>
                          <Button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white transition-colors duration-200">Complete KYC</Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </div>

      {/* Chat button and sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-6 right-6 rounded-full shadow-lg w-12 h-12 bg-blue-500 hover:bg-blue-600 transition-colors duration-200" size="icon">
            <MessageSquare className="h-5 w-5 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-96 bg-white text-gray-800">
          <SheetHeader>
            <SheetTitle className="text-lg text-gray-800">Chat with User</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col h-[calc(100vh-120px)]">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Badge variant="secondary" className="mr-2 text-xs bg-blue-100 text-blue-800">Agent</Badge>
                  <p className="bg-gray-100 rounded-lg p-3 text-gray-800 text-sm">Welcome to the KYC session. How can I assist you today?</p>
                </div>
                <div className="flex items-start justify-end">
                  <p className="bg-blue-100 rounded-lg p-3 text-gray-800 text-sm">Hi, I'm ready to start the verification process.</p>
                  <Badge variant="secondary" className="ml-2 text-xs bg-gray-200 text-gray-800">User</Badge>
                </div>
              </div>
            </ScrollArea>
            <div className="mt-4">
              <form className="flex space-x-2">
                <Input placeholder="Type a message..." className="flex-1 text-sm bg-white border-gray-300 text-gray-800 focus:ring-blue-500" />
                <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
