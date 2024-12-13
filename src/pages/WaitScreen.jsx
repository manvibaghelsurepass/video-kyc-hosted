import { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { useNavigate } from "react-router-dom"
import './WaitScreen.css'
import DocumentImage from '../assets/Document-Image.svg';
import agentIcon from '/src/assets/voip_03-1024x721.jpg.webp'
import {useDispatch, useSelector} from "react-redux";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "/src/components/ui/dialog"
import {AlertCircle} from "lucide-react";
import axios from "axios";
import {axiosInstance} from "/src/axiosinstance/axiosinstance.js";
import {getReplaySession} from "/src/service//manager.js";
import initializeSocket from "/src/socket.js";
import {setQueueData, setSocket} from "/src/slices/socket.js";
import {setAgentMeetingId, setToken} from "/src/slices/appSlice.js";
import Wave from "/src/assets/svg/Wave.jsx";
export default function WaitScreen() {
  const { t } = useTranslation()
  const [totalTimeLeft, setTotalTimeLeft] = useState(119) // Start from 1:59
  const navigate = useNavigate()
    const {queryParams, queryStrings} = useSelector(state => state.appSlice);
    const [dialog, setDialog] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        const checkTimes = [120, 110, 100, 90, 80, 70, 25, 60, 67, 65, 63, 60, 58, 55, 53, 50, 48, 45, 43, 40, 37, 35, 33, 30, 28, 22, 18, 15, 12, 9, 5, 2];

        async function IsAgentActive() {
            if (sessionId) {
                try {
                    const url = `https://api.videosdk.live/v2/sessions/${sessionId}/participants/active`;

                    const options = {
                        method: "GET",
                        headers: {
                            "Authorization": queryParams?.token,
                            "Content-Type": "application/json",
                        },
                    };
                    const result = await axios.get(url, options);
                    if (result?.data.data?.length > 0) {
                        navigate('/meeting')
                    }

                } catch (err) {
                    console.log(err)
                }
            }
        }
        async function checkIsAgentJoin() {
            try {
                const options = {
                    method: "GET",
                    headers: {
                        "Authorization": queryParams?.token,
                        "Content-Type": "application/json",
                    },
                };

                const url = `https://api.videosdk.live/v2/sessions/?roomId=${queryParams?.meeting_id}`;

                const response = await axios.get(url, options);
                if (response?.data?.data[0]?.id) {
                    setSessionId(response?.data?.data[0]?.id)
                }
            } catch (err) {
                console.log(err)
            }

        }

        if (checkTimes.includes(totalTimeLeft)) {
            if (!localStorage?.getItem('signature')) {
                checkIsAgentJoin();
                IsAgentActive();
            }
        }

    }, [totalTimeLeft])

        useEffect(() => {
            if (totalTimeLeft === 0) {
                console.log("Time is up! Navigating to '/waiting'.");
                navigate('/waiting'); // Redirect when time runs out
            }
        }, [totalTimeLeft, navigate]);

        useEffect(() => {
            const timer = setInterval(() => {
                setTotalTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
            }, 1000)

            return () => clearInterval(timer)
        }, [])


        const minutes = Math.floor(totalTimeLeft / 60)
        const seconds = totalTimeLeft % 60

        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white">
                <h1 className="mb-6 text-xl font-semibold font-poppin  text-lg opacity-80 font-500 text-center font-poppins font-medium text-card-foreground font-poppins text-gray-900">
                    Video KYC Status
                </h1>

                <div
                    className="flex items-center justify-between w-full max-w-md p-6 mb-8 bg-white rounded-sm  border-2 border-blue-20">

                    <div className="text-left">
                        <p className="mb-1 text-gray-700">{t('You are in a Queue')}</p>
                        <p className="mb-1 text-lg font-medium text-blue-500 ">{t('Hang Tight,')}</p>
                        <br/>
                        <br/>
                        <p className="text-gray-600">
                            {t('')} <br/> {t('')}
                        </p>

                    </div>
                    <div className="mb-20 text-right text-gray-600 ">
                        <p>{t('Keep your original')}</p>
                        <h6 className="font-medium">{t('PAN Card')}</h6>
                        <p>{t('with you')}</p>
                        <img
                            src={DocumentImage}
                            alt=""
                            className="w-32 h-auto mt-1"
                        />

                    </div>
                </div>

                <p className="text-gray-600 mb-9">
                    {t('Closing tab may reset your queue position.')}
                </p>

                <div className="relative flex items-center justify-center mb-8">
                    <div className="relative flex items-center justify-center w-32 h-32">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="relative flex items-center justify-center w-32 h-32">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative w-33 h-33">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            {/* Outer circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="48"
                                                fill="none"
                                                stroke="#CBD5E1"
                                                strokeWidth="4"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="48"
                                                fill="none"
                                                stroke="#2563EB"
                                                strokeWidth="4"
                                                strokeDasharray="301.59" /* Circumference = 2 * π * r */
                                                strokeDashoffset={(301.59 * (119 - totalTimeLeft)) / 119} /* Swap logic for progress */
                                                transform="rotate(-90 50 50)" /* Start at the top */
                                            />
                                            {/* Wave Animation */}
                                           <Wave/>

                                        </svg>
                                        {/* Centered Timer */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-2xl font-bold text-gray-900">
                                                {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                                            </div>
                                            <div className="text-gray-900 text-md">min</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="mb-10 text-gray-900 text-md">{t('Connecting to an agent shortly')}</p>
                <div className="space-y-4">
                    <p className="text-gray-600">
                        {t('Did You Know? Video KYC ensures quick and secure verification.')}
                    </p>
                    <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                        {t('Need Customer Support?')}
                    </a>
                </div>
            </div>
        )
}


// =============================================


// ============================================
// 'use client'
// import { useState, useEffect, useRef } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Card } from "/src/components/ui/card"
// import { Button } from "/src/components/ui/button"
// import { Calendar, Camera, XCircle } from "lucide-react"
// import { useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import surepassLogo from '/src/assets/surepassLogo.png'
// import darkSPLogo from '/src/assets/White-Surepass-Logo.png'
// const useCountdown = (initialMinutes = 0, initialSeconds = 11) => {
//   const [minutes, setMinutes] = useState(initialMinutes)
//   const [seconds, setSeconds] = useState(initialSeconds)

//   useEffect(() => {
//     const timer = setInterval(() => {
//       if (seconds > 0) {
//         setSeconds(seconds - 1)
//       } else if (minutes > 0) {
//         setMinutes(minutes - 1)
//         setSeconds(59)
//       }
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [minutes, seconds])

//   return { minutes, seconds }
// }
// const AnimatedNumber = ({ number }) => {
//   return (
//     <div className="relative w-16 h-16 overflow-hidden bg-card">
//       <AnimatePresence initial={false} mode="popLayout">
//         <motion.div
//           key={number}
//           initial={{ rotateX: -90, y: '50%' }}
//           animate={{ rotateX: 0, y: '0%' }}
//           exit={{ rotateX: 90, y: '-50%' }}
//           transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
//           style={{ transformOrigin: 'center bottom' }}
//           className="absolute inset-0 flex items-center justify-center"
//         >
//           <div className="relative flex items-center justify-center w-full h-full">
//             <span className="z-10 text-2xl font-bold text-card-foreground">{number.toString().padStart(2, '0')}</span>
//             <motion.div
//               className="absolute inset-0 bg-gradient-to-b from-transparent via-muted to-muted"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 0.7 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.2 }}
//             />
//           </div>
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   )
// }
// const QueuePosition = ({ position }) => {
//     return (
//       <div className="flex items-center mt-4 space-x-2">
//         <span className="text-sm font-medium text-muted-foreground">Your position:</span>
//         <div className="relative px-3 py-1 overflow-hidden rounded-full bg-primary/10">
//           <AnimatePresence mode="popLayout">
//             <motion.span
//               key={position}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.3 }}
//               className="text-lg font-bold text-primary"
//             >
//               {position}
//             </motion.span>
//           </AnimatePresence>
//           {/* <motion.div
//             className="absolute bottom-0 left-0 h-0.5 bg-primary"
//             initial={{ width: 0 }}
//             animate={{ width: `${(11 - position) * 10}%` }}
//             transition={{ duration: 0.5 }}
//           /> */}
//         </div>
//       </div>
//     )
//   }
// const CameraView = () => {
//   const videoRef = useRef(null)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     async function setupCamera() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true })
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream
//         }
//       } catch (err) {
//         console.error('Error accessing camera:', err)
//         setError('Unable to access camera. Please check permissions.')
//       }
//     }

//     setupCamera()

//     return () => {
//       if (videoRef.current && videoRef.current.srcObject) {
//         const tracks = videoRef.current.srcObject.getTracks()
//         tracks.forEach(track => track.stop())
//       }
//     }
//   }, [])

//   if (error) {
//     return (
//       <div className="relative w-[300px] h-[200px] bg-gray-800 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
//         {/* <XCircle className="w-12 h-12 text-red-500" /> */}
//         <p className="mt-2 text-xs text-center text-white">{error}</p>
//       </div>
//     )
//   }

//   return (
//     <div className="relative w-[300px] h-[200px] rounded-lg ring-2 ring-primary p-[2px]  overflow-hidden mb-6">
//       <video ref={videoRef} autoPlay playsInline muted className="object-cover w-full h-full rounded-lg" />
//       <div className="absolute w-3 h-3 bg-red-500 rounded-full bottom-2 left-2"></div>
//     </div>
//   )
// }
// export default function WaitScreen() {
//   const { minutes, seconds } = useCountdown()
//   const [queuePosition, setQueuePosition] = useState(10)
//   const navigate = useNavigate()
//   const {theme} = useSelector(state => state.appSlice);
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setQueuePosition((prevPosition) => Math.max(1, prevPosition - 1))
//     }, 5000) // Decrease queue position every 5 seconds

//     return () => clearInterval(interval)
//   }, [])

//   return (
//     <div className="relative flex flex-col items-center justify-center p-4 h-dvh bg-background text-foreground">
//     <div className="absolute flex justify-between left-4 right-4 top-4">
//     <img src={ theme==='dark' ? darkSPLogo : surepassLogo} alt="" className={'h-7 w-fit'}/>
//       <Button variant="outline" size="sm" onClick={()=>{
//          navigate('/joining/schedule')
//       }} className="flex items-center gap-2">
//         <Calendar className="w-4 h-4" />
//         Schedule Later
//       </Button>
//     </div>
//       <h1 className="mb-4 text-2xl font-bold text-center">All our agents are currently busy.</h1>
//       <p className="mb-4 text-center text-muted-foreground">Please wait while an agent initiates the video call.</p>
//       <CameraView />
//       <p className="mb-4 text-center text-muted-foreground">Approximate wait time:</p>
//       <div className="flex mb-4 space-x-4">
//         <Card className="p-0 overflow-hidden bg-card">
//           <AnimatedNumber number={minutes} />
//           <div className="p-1 text-center bg-muted">
//             <span className="text-xs text-muted-foreground">MIN</span>
//           </div>
//         </Card>
//         <Card className="p-0 overflow-hidden bg-card">
//           <AnimatedNumber number={seconds} />
//           <div className="p-1 text-center bg-muted">
//             <span className="text-xs text-muted-foreground">SECS</span>
//           </div>
//         </Card>
//       </div>
//       <QueuePosition position={queuePosition} />
//       <p className="mt-6 text-center text-muted-foreground">
//         You are currently in a queue. Closing the app may reset your queue progress.
//       </p>
//     </div>
//   )
// }

// ==============================================
// import { useState, useEffect } from "react"
// import { Button } from "/src/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "/src/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "/src/components/ui/avatar"
// import { Calendar, Clock } from "lucide-react"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "/src/components/ui/dropdown-menu"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "/src/components/ui/table"
// import { Badge } from "/src/components/ui/badge"
// import { useNavigate } from "react-router-dom"

// export default function QueuePage() {
//   const initialQueuePosition = 3;
//   const totalInQueue = 20;
//   const userName = "Joy C.";
//   const estimatedTimePerPerson = 5; // minutes
//   const navigate = useNavigate()
//   const [queuePosition, setQueuePosition] = useState(initialQueuePosition);
//   const [totalEstimatedTime, setTotalEstimatedTime] = useState(initialQueuePosition * estimatedTimePerPerson * 60); // Convert to seconds

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTotalEstimatedTime((prevTime) => {
//         if (prevTime > 0) {
//           return prevTime - 1;
//         } else {
//           clearInterval(timer);
//           return 0;
//         }
//       });

//       // Update queue position every 5 minutes (300 seconds)
//       if (totalEstimatedTime % 300 === 0 && queuePosition > 1) {
//         setQueuePosition((prevPosition) => prevPosition - 1);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [totalEstimatedTime, queuePosition]);

//   const formatTime = (timeInSeconds) => {
//     const minutes = Math.floor(timeInSeconds / 60);
//     const seconds = timeInSeconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   };

//   const queueList = [
//     { name: "Alex M.", position: 1, scheduledTime: "10:00 AM", status: "In Progress" },
//     { name: "Sam K.", position: 2, scheduledTime: "10:15 AM", status: "Waiting" },
//     { name: userName, position: queuePosition, scheduledTime: "10:30 AM", status: "Waiting" },
//     { name: "Taylor R.", position: queuePosition + 1, scheduledTime: "10:45 AM", status: "Waiting" },
//     { name: "Jordan L.", position: queuePosition + 2, scheduledTime: "11:00 AM", status: "Waiting" },
//   ];

//   return (
//     <div className="flex flex-col min-h-screen bg-background">
//       <header className="sticky top-0 z-10 flex justify-end p-3 border-b shadow bg-card border-border">
//             <Button variant="outline" size="sm" onClick={()=>{
//                 navigate('/joining/schedule')
//             }} className="text-xs">
//               <Calendar className="w-3 h-3 mr-1" />
//               Schedule Later
//             </Button>
//       </header>

//       <main className="flex-1 p-4 space-y-4 overflow-y-auto">
//         <Card className="border-none shadow-sm">
//           <CardContent className="pt-6 pb-6">
//             <div className="mb-4 text-sm text-center text-muted-foreground">Your Video KYC Queue Status</div>
//             <div className="flex justify-center">
//               <div className="relative w-40 h-40">
//                 <svg className="w-full h-full transform -rotate-90">
//                   <circle
//                     className="text-blue-100"
//                     strokeWidth="8"
//                     stroke="currentColor"
//                     fill="transparent"
//                     r="70"
//                     cx="80"
//                     cy="80"
//                   />
//                   <circle
//                     className="text-blue-600 transition-all duration-1000 ease-in-out"
//                     strokeWidth="8"
//                     stroke="currentColor"
//                     fill="transparent"
//                     r="70"
//                     cx="80"
//                     cy="80"
//                     strokeDasharray="439.6"
//                     strokeDashoffset={`${439.6 * (1 - queuePosition / totalInQueue)}`}
//                   />
//                 </svg>
//                 <div className="absolute text-3xl font-bold transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//                   {queuePosition}
//                 </div>
//               </div>
//             </div>
//             <p className="mt-4 text-sm text-center text-muted-foreground">Your position in queue</p>
//             <div className="mt-4 text-center">
//               <p className="text-sm font-medium">Estimated Wait Time</p>
//               <p className="text-2xl font-bold text-blue-600">{formatTime(totalEstimatedTime)}</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border-none shadow-sm">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg">Queue List</CardTitle>
//           </CardHeader>
//           <CardContent className="p-0">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[80px]">Position</TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Scheduled Time</TableHead>
//                   <TableHead className="text-right">Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {queueList.map((person) => (
//                   <TableRow key={person.position} className={person.name === userName ? "bg-blue-50" : ""}>
//                     <TableCell className="font-medium">{person.position}</TableCell>
//                     <TableCell>
//                       <div className="flex items-center space-x-2">
//                         <Avatar className="w-6 h-6">
//                           <AvatarImage src={`/placeholder.svg?height=24&width=24&text=${person.name.charAt(0)}`} alt={person.name} />
//                           <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
//                         </Avatar>
//                         <span className={person.name === userName ? "font-semibold" : ""}>{person.name}</span>
//                         {person.name === userName && (
//                           <Badge variant="secondary" className="ml-2">You</Badge>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell>{person.scheduledTime}</TableCell>
//                     <TableCell className="text-right">
//                       <Badge
//                         variant={person.status === "In Progress" ? "default" : "secondary"}
//                       >
//                         {person.status}
//                       </Badge>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }


// ================================================
// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Button } from "/src/components/ui/button"
// import { Card, CardContent } from "/src/components/ui/card"
// import { Calendar, Camera, CameraOff } from "lucide-react"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "/src/components/ui/dropdown-menu"
// import { Badge } from "/src/components/ui/badge"
// import { Alert, AlertDescription, AlertTitle } from "/src/components/ui/alert"

// export default function Component() {
//   const [queuePosition, setQueuePosition] = useState(20);
//   const totalInQueue = 20;
//   const estimatedTimePerPerson = 30; // seconds
//   const [totalEstimatedTime, setTotalEstimatedTime] = useState(queuePosition * estimatedTimePerPerson);
//   const [cameraActive, setCameraActive] = useState(false);
//   const [cameraError, setCameraError] = useState<string | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTotalEstimatedTime((prevTime) => {
//         if (prevTime > 0) {
//           return prevTime - 1;
//         } else {
//           clearInterval(timer);
//           return 0;
//         }
//       });

//       setQueuePosition((prevPosition) => {
//         if (prevPosition > 1) {
//           return prevPosition - 1;
//         } else {
//           clearInterval(timer);
//           return 1;
//         }
//       });
//     }, 1000);

//     return () => {
//       clearInterval(timer);
//       stopCamera();
//     };
//   }, []);

//   useEffect(() => {
//     setTotalEstimatedTime(queuePosition * estimatedTimePerPerson);
//   }, [queuePosition]);

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const circumference = 2 * Math.PI * 46; // 46 is the radius of the circle
//   const offset = circumference - (queuePosition / totalInQueue) * circumference;

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//         setCameraActive(true);
//         setCameraError(null);
//       }
//     } catch (err) {
//       console.error("Error accessing camera:", err);
//       setCameraError("Failed to access camera. Please check your permissions and try again.");
//       setCameraActive(false);
//     }
//   };

//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
//       tracks.forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//       setCameraActive(false);
//     }
//   };

//   const toggleCamera = async () => {
//     if (cameraActive) {
//       stopCamera();
//     } else {
//       await startCamera();
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       <header className="sticky top-0 z-10 flex justify-end p-3 bg-white shadow">
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="outline" size="sm" className="text-xs">
//               <Calendar className="w-3 h-3 mr-1" />
//               Schedule Later
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent>
//             <DropdownMenuItem>
//               <Calendar className="w-4 h-4 mr-2" /> Today at 2:00 PM
//             </DropdownMenuItem>
//             <DropdownMenuItem>
//               <Calendar className="w-4 h-4 mr-2" /> Tomorrow at 10:00 AM
//             </DropdownMenuItem>
//             <DropdownMenuItem>
//               <Calendar className="w-4 h-4 mr-2" /> Custom Date & Time
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </header>

//       <main className="flex-1 p-4 space-y-4 overflow-y-auto">
//         <Card className="overflow-hidden border-none shadow-sm">
//           <div className="relative bg-gray-900 aspect-video">
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
//             />
//             {!cameraActive && (
//               <div className="flex items-center justify-center w-full h-full text-white">
//                 Camera is off
//               </div>
//             )}
//             <Button
//               className="absolute z-10 bottom-4 right-4"
//               size="sm"
//               onClick={toggleCamera}
//               variant="secondary"
//             >
//               {cameraActive ? <CameraOff className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
//               {cameraActive ? "Turn Off Camera" : "Turn On Camera"}
//             </Button>
//           </div>
//         </Card>

//         {cameraError && (
//           <Alert variant="destructive">
//             <AlertTitle>Camera Error</AlertTitle>
//             <AlertDescription>{cameraError}</AlertDescription>
//           </Alert>
//         )}

//         <Card className="border-none shadow-sm">
//           <CardContent className="pt-6 pb-6">
//             <h2 className="mb-4 text-lg font-semibold text-center text-gray-700">Your Video KYC Queue Status</h2>
//             <div className="flex justify-center">
//               <div className="relative w-40 h-40">
//                 <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
//                   <circle
//                     className="text-gray-200"
//                     strokeWidth="8"
//                     stroke="currentColor"
//                     fill="transparent"
//                     r="46"
//                     cx="50"
//                     cy="50"
//                   />
//                   <circle
//                     className="text-blue-600"
//                     strokeWidth="8"
//                     stroke="currentColor"
//                     fill="transparent"
//                     r="46"
//                     cx="50"
//                     cy="50"
//                     strokeDasharray={circumference}
//                     strokeDashoffset={offset}
//                     strokeLinecap="round"
//                   />
//                 </svg>
//                 <div className="absolute text-3xl font-bold transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//                   {queuePosition}
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center justify-center mt-4">
//               <p className="mr-2 text-sm text-muted-foreground">Your position in queue</p>
//               <Badge variant="secondary" className="text-sm font-bold">#{queuePosition}</Badge>
//             </div>
//             <div className="mt-4 text-center">
//               <p className="text-sm font-medium">Estimated Wait Time</p>
//               <p className="text-2xl font-bold text-blue-600">{formatTime(totalEstimatedTime)}</p>
//             </div>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }


// ===================================================
// "use client"
//
// import { useState, useEffect, useRef } from "react"
// import { Button } from "/src/components/ui/button"
// import { Card, CardContent, CardTitle } from "/src/components/ui/card"
// import { Calendar, Camera, CameraOff, ChevronLeft, User } from "lucide-react"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from "/src/components/ui/dropdown-menu"
// import { Alert, AlertDescription, AlertTitle } from "/src/components/ui/alert"
// import { useNavigate } from "react-router-dom"
// import surepassLogo from '/src/assets/surepassLogo.png'
// import darkSPLogo from '/src/assets/White-Surepass-Logo.png'
// import { useSelector } from "react-redux"
// import { Avatar, AvatarImage, AvatarFallback } from '/src/components/ui/avatar.jsx'
// export default function WaitScreen() {
//     const { socket } = useSelector(state => state.SocketHandle)
//     const [queuePosition, setQueuePosition] = useState(20);
//     const totalInQueue = 10;
//     const estimatedTimePerPerson = 1; // seconds
//     const [totalEstimatedTime, setTotalEstimatedTime] = useState(queuePosition * estimatedTimePerPerson);
//     const [cameraActive, setCameraActive] = useState(true);
//     const [cameraError, setCameraError] = useState(null);
//     const videoRef = useRef(null);
//     const navigate = useNavigate()
//     const { theme } = useSelector(state => state.appSlice);
//     const [queuePayload, setQueuePayload] = useState({
//         "message_type": "ELEMENT",
//         "element_type": "NOTIFICATION_MESSAGE",
//         "text": "All our agents are currently busy assisting other customers. Your request is important to us. Please stay on the line. Your current position in the queue is displayed below.",
//         "action": "SHOW_TIMER",
//         "parameters": {
//             "current_queue_position": 5
//         }})
//
//     useEffect(()=>{
//        navigate('/meeting')
//     },[])
//     useEffect(() => {
//         startCamera();
//         const timer = setInterval(() => {
//             setTotalEstimatedTime((prevTime) => {
//                 if (prevTime > 0) {
//                     return prevTime - 1;
//                 } else {
//                     clearInterval(timer);
//                     return 0;
//                 }
//             });
//
//             setQueuePosition((prevPosition) => {
//                 if (prevPosition > 1) {
//                     return prevPosition - 1;
//                 } else {
//                     clearInterval(timer);
//                     return 1;
//                 }
//             });
//         }, 1000);
//
//         return () => {
//             clearInterval(timer);
//             stopCamera();
//         };
//     }, []);
//
//     useEffect(() => {
//         setTotalEstimatedTime(queuePosition * estimatedTimePerPerson);
//     }, [queuePosition]);
//
//     const formatTime = (seconds) => {
//         const minutes = Math.floor(seconds / 60);
//         const remainingSeconds = seconds % 60;
//         return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//     };
//
//     const circumference = 2 * Math.PI * 47; // 47 is the radius of the circle
//     const offset = circumference - (queuePosition / totalInQueue) * circumference;
//
//     const startCamera = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//             if (videoRef.current) {
//                 videoRef.current.srcObject = stream;
//                 videoRef.current.play();
//                 setCameraActive(true);
//                 setCameraError(null);
//             }
//         } catch (err) {
//             console.error("Error accessing camera:", err);
//             setCameraError("Failed to access camera. Please check your permissions and try again.");
//             setCameraActive(false);
//         }
//     };
//
//     const stopCamera = () => {
//         if (videoRef.current && videoRef.current.srcObject) {
//             const tracks = (videoRef.current.srcObject).getTracks();
//             tracks.forEach(track => track.stop());
//             videoRef.current.srcObject = null;
//             setCameraActive(false);
//         }
//     };
//
//     const toggleCamera = async () => {
//         if (cameraActive) {
//             stopCamera();
//         } else {
//             await startCamera();
//         }
//     };
//
//
//     useEffect(()=>{
//         if(socket){
//             socket.onAny((eventName, ...args) => {
//                 if(eventName === "INTERFACE_OUTGOING_MESSAGE"){
//                     if(args[0]?.data?.interface_block_id === "notify_queue_status"){
//                         setQueuePayload(args[0]?.data?.message)
//                     }
//                 }
//             })
//         }
//     },[socket])
//
//
//
//     return (
//         <div className="flex flex-col h-dvh bg-background">
//             <header className="top-0 z-10 flex justify-between p-3 shadow bg-background">
//                 <section className="flex items-center gap-2">
//                     <Button variant="outline" onClick={() => {
//                         navigate('/permissions')
//                     }} className={'bg-secondary text-secondary-foreground'} size="icon">
//                         <ChevronLeft className="w-6 h-6" />
//                     </Button>
//                     <img src={theme === 'dark' ? darkSPLogo : surepassLogo} alt="" className={'h-7'} />
//                 </section>
//                 <Button variant="outline" onClick={() => {
//                     navigate('/joining/schedule')
//                 }} className="flex items-center text-sm bg-secondary text-secondary-foreground">
//                     <Calendar className="w-5 h-5 mr-1" />
//                     Schedule Later
//                 </Button>
//             </header>
//
//             <main className="flex items-start justify-center flex-1 p-4 overflow-y-auto bg-background">
//                 <div className="w-full max-w-2xl">
//
//                     {/* <p className="mb-6 text-lg font-medium text-center text-gray-600">Welcome to your Video KYC session</p> */}
//                     <Card className="border-none shadow-none">
//                         <CardContent className="pt-6 pb-6">
//                             <h2 className="mb-2 text-2xl font-semibold text-center text-gray-700">Hey! Ayush</h2>
//                             <h2 className="mb-4 text-lg font-semibold text-center text-gray-700">Your Video KYC Queue Status</h2>
//                             <div className="flex flex-col items-center justify-center md:flex-row">
//                                 <div className="flex flex-col items-center">
//                                     <div className="relative w-48 h-48">
//                                         <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
//                                             <circle
//                                                 className="text-gray-200"
//                                                 strokeWidth="6"
//                                                 stroke="currentColor"
//                                                 fill="transparent"
//                                                 r="47"
//                                                 cx="50"
//                                                 cy="50"
//                                             />
//                                             <circle
//                                                 className="text-blue-600"
//                                                 strokeWidth="6"
//                                                 stroke="currentColor"
//                                                 fill="transparent"
//                                                 r="47"
//                                                 cx="50"
//                                                 cy="50"
//                                                 strokeDasharray={circumference}
//                                                 strokeDashoffset={offset}
//                                                 strokeLinecap="round"
//                                             />
//                                         </svg>
//                                         <div className="absolute w-full px-4 text-center transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//                                             <p className="mb-2 text-sm font-medium">Estimated Wait Time</p>
//                                             <p className="text-3xl font-bold text-blue-600">{formatTime(totalEstimatedTime)}</p>
//                                         </div>
//                                     </div>
//                                     <div className="mt-4 text-center">
//                                         <p className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">{queuePayload?.text}
//                                         </p>
//                                             <div className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-full">
//                                                 #{queuePayload.parameters.current_queue_position}
//                                             </div>
//                                     </div>
//                                 </div>
//                                 <div className="flex justify-center w-full mt-6 md:w-auto md:mt-0">
//                                     <div className="relative w-4/6 overflow-hidden border border-blue-700 rounded-lg h-52 md:w-48 aspect-square bg-secondary text-secondary-foreground">
//                                         <video
//                                             ref={videoRef}
//                                             autoPlay
//                                             playsInline
//                                             className={`size-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
//                                         />
//                                         {!cameraActive && (
//                                             <div className="flex items-center justify-center w-full h-full gap-2 text-sm text-foreground">
//                                                 <span><CameraOff className="text-destructive" /></span>
//                                                 <p>Camera is off</p>
//                                             </div>
//                                         )}
//                                         <Button
//                                             className="absolute z-10 border border-blue-700 bottom-2 right-2 bg-secondary text-secondary-foreground"
//                                             onClick={toggleCamera}
//                                             variant="outline"
//                                         >
//                                             {cameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-3 h-3" />}
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </CardContent>
//                     </Card>
//
//                     {cameraError && (
//                         <Alert variant="destructive" className="mt-4">
//                             <AlertTitle>Camera Error</AlertTitle>
//                             <AlertDescription>{cameraError}</AlertDescription>
//                         </Alert>
//                     )}
//                 </div>
//             </main>
//         </div>
//     )
// }
