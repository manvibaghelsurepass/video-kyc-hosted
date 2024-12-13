import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {useMeeting, Constants, createCameraVideoTrack, usePubSub, useParticipant} from "@videosdk.live/react-sdk";
import {lowerCase, startCase} from "lodash";
import {motion, AnimatePresence} from "framer-motion";
import {Button} from "/src/components/ui/button";
import {Badge} from "/src/components/ui/badge";
import {ScrollArea} from "/src/components/ui/scroll-area";
import ovalFace from "/src/assets/Oval Cutout (1).png"
import rectangleDocument from "/src/assets/Rectangle Cutout (1).png"
import {
    Drawer, DrawerContent, DrawerTrigger,
} from "/src/components/ui/drawer";
import {
    Sheet, SheetContent, SheetTrigger
} from "/src/components/ui/sheet";
import {
    setAgentMeetingId,
    setRecording, setToken,
    setUserParticipantId,
    setQuestonarries
} from "/src/slices/appSlice.js";
import {fetchQuestionariesAPI} from "/src/service/manager.js";
import ChatBox from "/src/pages/ChatBox";
import {
    Camera,
    Mic,
    MicOff,
    Video,
    CheckCircle2,
    AlertCircle,
    User,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Phone,
    CameraOff,
    SwitchCamera,
    Loader,
    MessageCircleMore, CheckCircle,
} from "lucide-react";
import {FaRegDotCircle} from "react-icons/fa";
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "/src/components/ui/accordion"
import '../App.css';
import PhotoCapture from "./StepperComponent/photoCapture";
import Details from "./StepperComponent/Details";
import QuestionAndAnswer from "./StepperComponent/Question&Answer";
import FinalReview from "./StepperComponent/FinalReview";
import DocumentVerify from "./StepperComponent/DocumentVerify";
import axios from "axios";
import CornerDisplayName from "./BandwidthCheck";
import {ModeToggle} from "../components/mode-toggle";
import {setIsRejecting, setReceivedQuestions, setUserGeoLocation} from "/src/slices/socket.js";
import SwitchCameraListner from "/src/pages/SwitchCameraListner.jsx";
import {useToast} from "/src/components/ui/use-toast.js";
import {cn} from "/src/lib/utils.js";
import {ToastAction} from "/src/components/ui/toast.jsx";
import Micon from "/src/assets/Meetingview/Micon.jsx";
import Micof from "/src/assets/Meetingview/Micof.jsx";
import Chat from "/src/assets/Meetingview/Chat.jsx";
import Chatvideokyclogo from "/src/components/svg/svg/Chatvideokyclogo.jsx";
import Recording from "/src/components/svg/Meetingview/Recording.jsx";
import Recordingoff from "/src/components/svg/Meetingview/Recordingoff.jsx";
import Switchcamera from "/src/components/svg/Meetingview/Switchcamera.jsx";
import Switchcameraof from "/src/components/svg/Meetingview/Switchcameraof.jsx";
import Webcamon from "/src/components/svg/Meetingview/Webcamon.jsx";
import CropImage from "/src/components/CropImage.jsx";
const videoKYCsteps = [
    {type: 'details', id: 'details', title: 'Customer Details', icon: User},
    {type: 'capture', id: 'liveness', title: 'Capture a face image & Check liveness', icon: User},
    {type: 'document', id: 'document', title: 'Document Verification', icon: Camera},
    {type: 'questions', id: 'questions', title: 'Verify Basic Details Questions', icon: AlertCircle},
    {type: 'review', id: 'review', title: 'Final Review', icon: CheckCircle2}
]
const hemantSteps = [
    {type: 'details', id: 'details', title: 'Customer Details', icon: User},
]
function ParticipantView({participantId}) {
    const micRef = useRef(null);
    const webcamRef = useRef(null);
    const {questionaryQuestion, receivedQuestionsOnUserScreen} = useSelector(state => state.SocketHandle)
    const {mode, recording, queryParams} = useSelector((state) => state.appSlice);
    const [showMessage, setShowMessage] = useState('none');
    const dispatch = useDispatch()
    const {
        webcamStream,
        setQuality,
        micStream,
        webcamOn,
        micOn,
        isLocal,
        displayName,
    } = useParticipant(participantId);
    useEffect(() => {
        setQuality('high');
        if (!isLocal) {
            dispatch(setUserParticipantId(participantId))
        }
    }, [participantId]);
    useEffect(() => {
        if (webcamOn && webcamStream && webcamRef.current) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(webcamStream.track);
            webcamRef.current.srcObject = mediaStream;
            webcamRef.current.play().catch((error) => console.error('video error', error))
        }
    }, [webcamStream, webcamOn, webcamRef.current]);

    useEffect(() => {
        if (micRef.current) {
            if (micOn && micStream) {
                const mediaStream = new MediaStream();
                mediaStream.addTrack(micStream.track);

                micRef.current.srcObject = mediaStream;
                micRef.current
                    .play()
                    .catch((error) => console.error("videoElem.current.play() failed", error));
            } else {
                micRef.current.srcObject = null;
            }
        }
    }, [micStream, micOn]);
    const topic = 'QUESTIONARY'

    const {publish} = usePubSub(topic, {
        onMessageReceived: (data) => {
            dispatch(setReceivedQuestions(data?.message))
            setTimeout(() => {
                dispatch(setReceivedQuestions(null))
            }, 5000)
        },
    })
    useEffect(() => {
        publish(questionaryQuestion, {persist: true, sendOnly: ['USER']})
    }, [questionaryQuestion])

    usePubSub('SHOW_OVAL_AND_BOX', {
        onMessageReceived: (data) => {
            setShowMessage(data?.message)
        }
    })
    return (
        <motion.div
            key={participantId}
            className={`${participantId !== 'AGENT' ? `w-full relative h-full` : `absolute md:bottom-24 bottom-[120px]  w-40 sm:w-36 right-8 h-48  ${mode !== 'AGENT' && 'top-4 right-6 '} ${mode === 'USER' && participantId === 'USER' ? 'rounded-none' : 'rounded-2xl'} overflow-hidden shadow-md z-50   `}`}
            initial={{opacity: 0, scale: 0.8}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.3}}
        >
            {participantId !== 'AGENT' && mode === 'USER' && webcamOn && showMessage !== 'none' &&
                <img src={showMessage === 'oval' ? ovalFace : showMessage === 'rectangle' ? rectangleDocument : 'none'}
                     className={'absolute w-screen md:hidden h-screen '}/>}
            <audio  id="audio"  ref={micRef} autoPlay muted={isLocal}/>
            <div className={"flex"}>
            {mode == 'AGENT' && <CornerDisplayName
                {...{
                    isLocal,
                    displayName,
                    micOn,
                    webcamOn,
                    isPresenting: false,
                    participantId: participantId,
                    mouseOver: false,
                    // isPip: false,
                    // isActiveSpeaker: false,
                    webcamStream,
                    micStream
                }}
            />}
            {recording && mode === "AGENT" && participantId === 'USER' &&
                    <Badge className={'rounded-full  md:hidden h-8 bg-destructive hover:bg-destructive absolute text-destructive-foreground z-10  right-4 top-12 text-xs flex gap-2'}><FaRegDotCircle
                        className={'size-4'}/> REC</Badge>
            }
            </div>
            <motion.div
                className={`absolute ${participantId === 'AGENT' ? `bottom-2 ${mode === 'USER' && 'top-17 left-10  '}` : 'top-2 left-2 '} p-2  left-0  bg-opacity-100 rounded-full`}
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3, delay: 0.1}}
            >
                <div
                    className="flex items-center  space-x-2 rounded-2xl px-3  py-1 backdrop-blur-3xl bg-white/30  z-80 ">
                    <div>
                        <h3 className="font-semibold text-gray-100  text-md">{startCase(lowerCase(displayName))}</h3>
                    </div>
                </div>

            </motion.div>
            {receivedQuestionsOnUserScreen && mode !== 'AGENT' && (
                <motion.div
                    className={`${participantId !== 'AGENT' ? 'absolute' : 'hidden'} p-1 bottom-[20%] inset-x-0 mx-auto w-fit   bg-opacity-60 rounded-2xl`}
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: 0.1}}
                >
                    <div className="flex items-center space-x-2 text-white rounded-2xl px-3 py-1">
                        <div>
                            <h3 className="font-semibold text-white text-sm">
                                {startCase(lowerCase(receivedQuestionsOnUserScreen))}?
                            </h3>
                        </div>
                    </div>
                </motion.div>
            )}
            {webcamOn ?
                <video
                    autoPlay
                    playsInline
                    ref={webcamRef}
                    className={`w-full h-full rounded-2xl object-cover`} src="/placeholder.svg"/> :
                <div
                    className="w-full h-full  bg-secondary dark:bg-card dark:text-card-foreground text-secondary-foreground flex items-center justify-center">
                    <div className="w-10 h-10  bg-card dark:bg-secondary rounded-full flex items-center justify-center ">
                        <span className="text-lg font-semibold  text-secondary-foreground">
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>

                </div>}
        </motion.div>
    );
}
export default function MeetingView({setJoined}) {
    const {faceImage, panImage, userGeoLocation} = useSelector(state => state.SocketHandle)
    const dispatch = useDispatch();
    const [steps, setSteps] = useState([]);
    const [Base64, setBase64] = useState(null);
    const {t} = useTranslation();
    const [currentStep, setCurrentStep] = useState(0)
    const [showAllSteps, setShowAllSteps] = useState(false);
    const [progressStep, setProgressStep] = useState(0);
    // const [expandedItem, setExpandedItem] = useState(['details','capture','document','questions','review']);
    const [expandedItem, setExpandedItem] = useState(steps.map(step => step.id) || []);
    const [recordingLoading, setRecordingLoading] = useState(false);
    const {participants} = useMeeting({
        onRecordingStateChanged,
    });
    const {
        mode,
        participantId,
        queryParams,
        recording,
    } = useSelector((state) => state.appSlice);

    const {publish: sendUserLocation} = usePubSub('SEND_USER_LOCATION', {
        onMessageReceived: async (data) => {
            console.log(data?.payload, 'userLocation')
            dispatch(setUserGeoLocation(data?.payload))
        }
    })
    useEffect(() => {
        if (mode === 'USER') {
            sendUserLocation('SEND_USER_LOCATION', null, userGeoLocation);
        }
    }, []);

    useEffect(() => {
        if (queryParams?.email === 'evolvebrands_caseconstructions_console@surepass.io') {
            setSteps(hemantSteps)
        } else {
            setSteps(videoKYCsteps)
        }
    }, [queryParams])
    useEffect(() => {
        const items = steps.map(step => step.id)
        setExpandedItem(items)
    }, [steps])

    const {captureImage, webcamStream, webcamOn} = useParticipant(participantId);

    async function imageCapture() {
        if (webcamOn && webcamStream) {
            const base64 = await captureImage({height: 2900, width: 2040}); // captureImage will return base64 string
            setBase64(base64)
        } else {
            console.error("Camera must be on to capture an image");
        }
    }

    const handleNextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prevStep => prevStep + 1);
            setProgressStep(prevStep => prevStep + 1);
        }
        if (currentStep === steps.length - 2) {
            setShowAllSteps(true);
        }
        if (currentStep < steps.length - 1) {
            toggleItem(steps[currentStep + 1].id);
        }
    }
    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prevStep => prevStep - 1);
            setProgressStep(prevStep => prevStep - 1);
            setShowAllSteps(false);
            toggleItem(steps[currentStep - 1].id);
        }
    }
    // change
    const toggleItem = (id) => {
        setExpandedItem(expandedItem === id ? [] : id);
    };
    function onRecordingStateChanged(data) {
        const {status} = data;
        if (status === Constants.recordingEvents.RECORDING_STARTING) {
            setRecordingLoading(true)
        } else if (status === Constants.recordingEvents.RECORDING_STARTED) {
            setRecordingLoading(false);
            dispatch(setRecording(true))
        } else if (status === Constants.recordingEvents.RECORDING_STOPPING) {
            setRecordingLoading(true)
        } else if (status === Constants.recordingEvents.RECORDING_STOPPED) {
            dispatch(setRecording(false))
            setRecordingLoading(false)
        } else {
            //
        }
    }
    console.log(currentStep, 'expandedItem')

    const {publish: showOvalAndRectangle} = usePubSub('SHOW_OVAL_AND_BOX')

    useEffect(() => {
        if (currentStep === 1) {
            return showOvalAndRectangle('oval')
        } else if (currentStep === 2) {
            return showOvalAndRectangle('rectangle')
        } else {
            return showOvalAndRectangle('none')
        }
    }, [currentStep]);

    async function getCustomerQuestionaries() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_SUPERFLOW_BASE_URL}/api/v1/vkyc/agent/fetch-questionnaire`, {
                headers: {
                    'Authorization': `Bearer ${queryParams?.superflow_token}`
                }
            });
            const {data = {}} = await response.data;
            console.log("Data", data);
            dispatch(setQuestonarries(data?.questionnaire));
        } catch (error) {
            console.log("Error", error);
        }
    }

    useEffect(() => {

        if (mode === 'AGENT' && queryParams?.email !== 'evolvebrands_caseconstructions_console@surepass.io') {
            getCustomerQuestionaries();
        }

    }, []);

    return (<div className="flex h-dvh text-foreground  border-0">
        <div className={`w-full ${mode === 'AGENT' ? 'md:w-[40%]' : 'md:w-[100%] h-full border-0'} ${!queryParams?.superflow_token && 'p-0  '} flex   flex-col`}>
            {!queryParams?.signature && <header className="md:flex hidden mt-1 justify-between   items-center mb-4 ml-6 ">
                <div>
                    {mode === 'AGENT' &&

                        <h1 className="text-xl  font-semibold text-foreground flex items-center space-x-1">
                        <span>
                       <Chatvideokyclogo/>
                        </span>
                        <span>Video KYC Session</span>
                        </h1>}

                </div>
                {/*<div className="flex items-center  space-x-4">*/}
                {/*    {recording &&*/}
                {/*        <div className="hidden md:flex items-center bg-yellow-900 space-x-4 ">*/}
                {/*            <Badge*/}
                {/*                className={'rounded-full  bg-destructive text-destructive-foreground z-10 left-8 top-12 text-xs flex gap-2'}><FaRegDotCircle*/}
                {/*                className={'size-4'}/> Recording</Badge>*/}
                {/*        </div>*/}
                {/*    }*/}
                {/*    /!*<ModeToggle/>*!/*/}
                {/*</div>*/}
            </header>}

            <div
                className="flex-1 rounded-none md:rounded-xl overflow-hidden  md:p-3 shadow-sm border-0 bg-card text-card-foreground  relative">
                {[...participants.keys()].map((participantId) => (<ParticipantView
                    participantId={participantId}
                    key={participantId}
                />))}
                <Controls recordingLoading={recordingLoading}/>
            </div>
        </div>
        {mode === 'AGENT' &&
            <div
                className="w-[60%] bg-card text-card-foreground   mb-4 ml-4 border-border ${!queryParams?.superflow_token && 'm-5 mt-16'} rounded-2xl p-6 md:flex hidden flex-col shadow-xl">
                <div className="flex items-center relative">
                    <div
                        className="relative mt-2 mr-4"
                        style={{
                            width: "80px", // Adjusted size
                            height: "80px", // Adjusted size
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative", // Ensure the buttons are positioned outside
                        }}
                    >
                        {/* Circular Progress SVG */}
                        <svg
                            height="80" // Size of the SVG
                            width="80" // Size of the SVG
                            style={{
                                transform: "rotate(-90deg)", // Rotate to start the progress from the top
                            }}
                        >
                            {/* Background Circle */}
                            <circle
                                r="34" // Adjusted radius (half of 80 minus strokeWidth)
                                cx="40" // Center x position (half of 80)
                                cy="40" // Center y position (half of 80)
                                fill="transparent"
                                stroke="#ADD8E6" // Light blue background color for the circle
                                strokeWidth="6" // Stroke width for the background circle
                            />
                            {/* Progress Circle */}
                            <circle
                                r="34" // Same radius as the background circle
                                cx="40" // Centered on the same x-axis
                                cy="40" // Centered on the same y-axis
                                fill="transparent"
                                stroke="#0000ff" // Blue progress color
                                strokeWidth="6" // Stroke width for the progress circle
                                strokeDasharray="213" // Circumference = 2πr ≈ 213
                                strokeDashoffset={213 - (progressStep / steps.length) * 213} // Progress calculation
                                style={{
                                    transition:"stroke-dashoffset 0.3s ease", // Smooth progress animation
                                }}
                            />
                        </svg>


                        {/* Progress Indicator */}
                        <div className="absolute flex flex-col items-center text-center">
                            <span className="text-md font-bold text-primary">{progressStep + 1}</span>
                            <span className="text-sm text-gray-500">of {steps.length}</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl mt-6 font-bold mb-4 text-card-foreground">Customer Identification</h2>
                        <p className="text-md font-poppin mt-2 text-gray-500">
                            Match the user's detail with their government ID <br/> proof
                        </p>
                    </div>

                    {/* Previous Button (Outside the circle) */}
                    {currentStep > 0 && (
                        <Button
                            onClick={handlePrevStep}
                            size="sm"
                            variant="outline"
                            className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 bg-secondary text-secondary-foreground"
                        >
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                    )}

                    {/* Next Button (Outside the circle) */}
                    {/*{currentStep < steps.length - 1 && (*/}
                    {/*    <Button*/}
                    {/*        onClick={handleNextStep}*/}
                    {/*        size="sm"*/}
                    {/*        className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground"*/}
                    {/*    >*/}
                    {/*        <ChevronRight className="h-7 w-7"/>*/}
                    {/*    </Button>*/}
                    {/*)}*/}
                </div>

                {/* Your existing content below */}
                <ScrollArea className="flex-1 pr-2">
                    <AnimatePresence mode="wait">
                        <Accordion
                            type="multiple"
                            className="w-full space-y-2  bg-card border-0 text-card-foreground"
                            value={expandedItem}
                            onValueChange={(val) => setExpandedItem(val || steps.map(step => step.id))} // Ensure value is always an array
                        >
                            <motion.div
                                key={currentStep}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                transition={{duration: 0.3}}
                                className="space-y-6"
                            >
                                {(steps || []).map((item, index) => {
                                    if (showAllSteps || index === currentStep) {
                                        return (
                                            <AccordionItem
                                                className="border-0 rounded-xl px-4 py-1 shadow-md"
                                                value={item?.id}
                                                key={item?.id}
                                            >
                                                <AccordionTrigger>
                                        <span className="flex text-card-foreground text-sm">
                                            {/* <item.icon className="h-5 w-5 mr-3"/> */}
                                            {/* {item.title} */}
                                        </span>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    {item.type === 'details' && <Details/>}
                                                    {item.type === 'capture' && (

                                                        <PhotoCapture
                                                            current={currentStep}
                                                            setBase64={setBase64}
                                                            Base64={Base64}
                                                            imageCapture={imageCapture}
                                                            dummyImage={faceImage}
                                                            imageType={'face'}
                                                        />
                                                    )}
                                                    {item.type === 'document' && <DocumentVerify
                                                        current={currentStep}
                                                        setBase64={setBase64}
                                                        Base64={Base64}
                                                        imageCapture={imageCapture}
                                                        dummyImage={panImage}
                                                        imageType={'document'}
                                                    />}
                                                    {item.type === 'questions' &&
                                                        <QuestionAndAnswer step={currentStep}/>}
                                                    {item.type === 'review' && <FinalReview/>}
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    } else {
                                        return null;
                                    }
                                })}
                            </motion.div>

                        </Accordion>
                    </AnimatePresence>

                </ScrollArea>

            </div>

        }
        {mode === 'AGENT' && currentStep < steps.length - 1 && (
            <Button
                onClick={handleNextStep}
                size="sm"
                className="absolute bottom-14 rounded-sm right-7 bg-primary text-primary-foreground"
            >
                <ChevronRight className="h-9 w-9" />
            </Button>
        )}
        {/*<Sheet>*/}
        {/*    <SheetTrigger asChild>*/}
        {/*        <Button*/}
        {/*            className="md:flex  fixed bottom-6  right-6 rounded-full hidden shadow-lg w-12 h-12 bg-primary text-primary-foreground transition-colors duration-200"*/}
        {/*            size="icon">*/}
        {/*            <MessageCircleMore className="h-6 w-6"/>*/}
        {/*        </Button>*/}
        {/*    </SheetTrigger>*/}
        {/*    <SheetContent className="bg-background text-foreground w-1/3 ">*/}
        {/*        <ChatBox/>*/}
        {/*    </SheetContent>*/}
        {/*</Sheet>*/}


    </div>)
}

export function Controls({recordingLoading}) {
    const {
        socket,
        userDetails,
        faceImage,
        panImage,
        userGeoLocation,
        decision
    } = useSelector(state => state.SocketHandle)
    const {leave, toggleMic, toggleWebcam, startRecording, end, stopRecording, getWebcams, changeWebcam} = useMeeting();
    const mMeeting = useMeeting();
    const [record, setRecord] = useState(true);
    const {mode, webhook, queryParams, recording} = useSelector((state) => state.appSlice);
    const localMicOn = mMeeting?.localMicOn;
    const dispatch = useDispatch()
    const localWebcamOn = mMeeting?.localWebcamOn;
    const [loading, setLoading] = useState(false);
    const [cameraSwitch, setCameraSwitch] = useState(false);
    const [cameras, setCameras] = useState([]);
    const {toast} = useToast()
    const [messageCount, setMessageCount] = useState(0)
    const [unreadCount, setUnreadCount] = useState(0)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    // const [messages, setMessages] = useState([]);
    const [sound] = useState(new Audio('/path/to/notification-sound.mp3')); // Add your sound path here
    const [unreadMessages, setUnreadMessages] = useState(0);
    const handleGetWebcams = async () => {
        const webcams = await getWebcams();
        setCameras(webcams);
    };
    const {publish: switchCameraPublish} = usePubSub(`SWITCH_PARTICIPANT_CAMERA_USER`, {
        onMessageReceived: async (data) => {
            if (mode === 'USER') {
                console.log(data)
                changeWebcam(cameraSwitch ? cameras[0]?.deviceId : cameras[1]?.deviceId);
                setCameraSwitch(!cameraSwitch)
            }
        }
    });
    const {publish: endMeeting} = usePubSub(`ENDMEETING`, {
        onMessageReceived: async (data) => {
            if (mode === 'USER') {
                end()
                dispatch(setAgentMeetingId(null))
                dispatch(setToken(null));
            }
        }
    });
    useEffect(() => {
        handleGetWebcams();
    }, []);
    // Function to simulate receiving a new message
    const receiveNewMessage = () => {
        if (!isDrawerOpen) {
            setUnreadMessages(prev => prev + 1);
        }
    };
    // Reset unread messages when drawer is opened
    useEffect(() => {
        if (isDrawerOpen) {
            setUnreadMessages(0);
        }
    }, [isDrawerOpen]);

    // Simulate receiving a new message every 5 seconds (for demonstration)
    useEffect(() => {
        const interval = setInterval(receiveNewMessage, 5000);
        return () => clearInterval(interval);
    }, []);
    const handleStartRecording = () => {
        const config = {
            layout: {
                type: "GRID", priority: "SPEAKER", gridSize: 2,
            }, theme: "DARK", mode: "video-and-audio", quality: "high", orientation: "landscape",
        };
        let transcription = {
            enabled: true, summary: {
                enabled: true,
                prompt: "Write summary in sections like Title, Agenda, Speakers, Action Items, Outlines, Notes and Summary",
            },
        };
        startRecording(null, null, config, transcription);
    };
    useEffect(() => {
        if (mode === 'AGENT') {
            handleStartRecording()
        }
    }, []);
    //Cleanup function for hemant client
    useEffect(() => {
        return async () => {
            localStorage.clear()
            window.parent.postMessage({action: 'closeIframe'}, '*');
            stopRecording();
            setLoading(true)
            if (mode === 'AGENT' && queryParams?.email === 'evolvebrands_caseconstructions_console@surepass.io') {
                const recordingUrl = `https://api.videosdk.live/v2/recordings`
                const webHookUrl = 'https://superflow.surepass.io/api/v1/workflows/finished';
                try {
                    const response = await axios.get(recordingUrl, {
                        params: {
                            roomId: mMeeting?.meetingId
                        }, headers: {
                            'Content-Type': 'application/json',
                            'Authorization': queryParams?.token
                        }
                    });
                    try {
                        const result = await axios.post(webHookUrl, {
                            data: response?.data?.data[0],
                            webhook_url: webhook,
                            customer_email: queryParams?.customer_email,
                            name: queryParams?.name
                        });
                        setLoading(false)
                        console.log(result)
                    } catch (error) {
                        setLoading(false)
                        console.error('Error occurred:', error.response ? error.response.data : error.message);
                    }
                } catch (error) {
                    setLoading(false)
                    console.error('Error occurred:', error.response ? error.response.data : error.message);
                }
            }

        }
    }, [])

    //Normal VKYC end meeting api
    async function endMeetingAction() {

        if (mode === 'AGENT' && queryParams?.email == 'evolvebrands_caseconstructions_console@surepass.io') {
            endMeeting('ENDMEETING')
            dispatch(setAgentMeetingId(null))
            dispatch(setToken(null));
        } else if (mode === 'AGENT') {
            try {
                const payload = {
                    customer_email: userDetails?.email,
                    name: `${userDetails?.first_name} ${userDetails?.last_name}`,
                    agent_action: decision || 'REJECTED',
                    pan_base64: panImage,
                    user_photo_base64: faceImage,
                    // reason: feedback,
                    meeting_id: queryParams?.meeting_id,
                    usergeolocation: userGeoLocation,
                };
                const result = await axios.post(`${import.meta.env.VITE_SUPERFLOW_BASE_URL}/api/v1/vkyc/agent/agent-action`,
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${queryParams.superflow_token}` // Replace with actual token
                        }
                    }
                );
                if (result) {
                    dispatch(setAgentMeetingId(null))
                    dispatch(setToken(null));
                    endMeeting('ENDMEETING')
                    localStorage.clear()
                    window.parent.postMessage({action: 'closeIframe'}, '*');
                    socket.emit('interface_interaction', {
                        "interaction_type": "TERMINATE",
                        "status": "FAILED",
                        // "description": feedback,
                    })
                }
                toast({
                    className: cn(
                        "top-0 right-0 flex fixed md:max-w-[420px] md:top-12 md:right-4 bg-white border-l-4 border-l-green-500 rounded-md shadow-lg"
                    ),
                    description: (
                        <div className="flex items-start space-x-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5"/>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">Application Rejected</p>
                                <p className="text-gray-500 dark:text-gray-400">KYC details submitted successfully.</p>
                            </div>
                        </div>
                    ),
                })
            }catch (err) {
                dispatch(setIsRejecting(false));
                toast({
                    className: cn(
                        "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4"
                    ),
                    variant: "destructive",
                    title: (
                        <h1>
                            {err.response.data.status_code} {err.response.data.message}
                        </h1>
                    ),
                    description:
                        startCase(err?.response?.data?.data?.remarks) ||
                        err?.response?.data?.message ||
                        "There was a problem with your request.",
                    action: <ToastAction altText="Try again">Try again</ToastAction>,
                });
            }
        }
        else {
            dispatch(setAgentMeetingId(null))
            dispatch(setToken(null));
            leave();
        }
    }
    return (<motion.div
        className="absolute bottom-5 left-0 right-0 mx-auto w-fit  space-x-5  px-10 py-1 rounded-2xl"
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3, delay: 0.2}}

    >


        <Button
            variant={localMicOn ? "secodary" : "blur-2xl"}
            size="icon"
            onClick={() => toggleMic()}
            className={`size-16  transition-colors "backdrop-blur-3xl bg-white/35 z-80 duration-200  mr-1 ${localMicOn ? '   backdrop-blur-3xl' : 'bg-white '} rounded-full`}
        >
            {localMicOn ?
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M23.76 8.70406C22.88 5.2374 19.7467 2.66406 16 2.66406C11.5867 2.66406 8 6.25073 8 10.6641V17.3307C8 19.2774 8.69333 21.0641 9.85333 22.4507"
                        stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path
                        d="M23.9999 13.3047V17.3314C23.9999 21.7447 20.4132 25.3314 15.9999 25.3314C15.0266 25.3314 14.0799 25.158 13.2266 24.838"
                        stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path
                        d="M7.81323 26.1041C9.9599 28.1041 12.8399 29.3307 15.9999 29.3307C22.6266 29.3307 27.9999 23.9574 27.9999 17.3307V14.6641"
                        stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M28.6666 3.98438L3.33325 29.3177" stroke="white" stroke-width="1.5" stroke-linecap="round"
                          stroke-linejoin="round"/>
                    <path d="M15.3999 7.33563V3.01562" stroke="white" stroke-width="1.5" stroke-linecap="round"
                          stroke-linejoin="round"/>
                    <path d="M11.3333 4.66406V9.9974" stroke="gray-500" stroke-width="1.5" stroke-linecap="round"
                          stroke-linejoin="round"/>
                </svg>
                : <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M29.7 10.8859C28.6 6.5526 24.6833 3.33594 20 3.33594C14.4833 3.33594 10 7.81927 10 13.3359V21.6693C10 24.1026 10.8667 26.3359 12.3167 28.0693"
                        stroke="#2563EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path
                        d="M30.0018 16.6328V21.6661C30.0018 27.1828 25.5185 31.6661 20.0018 31.6661C18.7852 31.6661 17.6018 31.4495 16.5352 31.0495"
                        stroke="#2563EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path
                        d="M9.76562 32.6359C12.449 35.1359 16.049 36.6693 19.999 36.6693C28.2823 36.6693 34.999 29.9526 34.999 21.6693V18.3359"
                        stroke="#2563EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M35.8346 4.98438L4.16797 36.651" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"
                          stroke-linejoin="round"/>
                    <path d="M19.25 9.16563V3.76562" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"
                          stroke-linejoin="round"/>
                    <path d="M14.168 5.83594V12.5026" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"
                          stroke-linejoin="round"/>
                </svg>

            }
        </Button>
            {mode === 'AGENT' &&
                <Button
                    variant={localWebcamOn ? "secodary" : "blur2xl"}
                    size="icon"
                    onClick={() => toggleWebcam()}
                    className={`size-16 transition-colors backdrop-blur-3xl bg-white/35 z-80 duration-200 mr-5  ${localWebcamOn ? ' backdrop-blur-3xl text-secondary-foreground' : ' backdrop-blur-3xl bg-white '} rounded-full`}
                >
                    {localWebcamOn ?
                        <Switchcamera/>
                        :
                        <Switchcameraof/>
                    }
                </Button>}

            {/*{mode === 'AGENT' && queryParams?.email !== 'evolvebrands_caseconstructions_console@surepass.io' && (*/}
            {/*    <Button*/}
            {/*        variant="secodary"*/}
            {/*        size="icon"*/}
            {/*        disabled={recordingLoading}*/}
            {/*        onClick={() => setRecord(!record)}*/}
            {/*        className="size-16 transition-colors backdrop-blur-3xl bg-white/35 z-80 duration-200 rounded-full mr-5"*/}
            {/*    >*/}
            {/*        {recording ? (*/}
            {/*         <Recording/>*/}
            {/*        ) : (*/}
            {/*            <Recordingoff/>*/}
            {/*        )}*/}
            {/*    </Button>*/}
            {/*)}*/}

            {mode === 'AGENT' &&

                <Button
                    onClick={() => switchCameraPublish('SWITCH_PARTICIPANT_CAMERA_USER')}
                    variant={switchCameraPublish ? "secodary" : "blur2xl"}
                    size="icon"
                    className={`transition-colors backdrop-blur-3xl bg-white/35 z-80 duration-200 text-secondary-foreground rounded-full size-16 mr-5`}
                >
                    {switchCameraPublish ? (
                        <Webcamon/>
                ) : (
                   <Webcamon/>
                    )}
            </Button>
        }
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                {/* Drawer Trigger */}
                <DrawerTrigger className="md:hidden">
                    <Button
                        size="icon"
                        className="relative mr-7 ml-5 backdrop-blur-3xl bg-white/35 z-80 hover:bg-gray-100 text-gray-800 rounded-full size-16"
                        aria-label="Open messages drawer"
                    >
                        <Chat/>

                        {/* Unread Messages Badge */}
                        {unreadMessages > 0 && (
                            <span
                                className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
                            >
                            {unreadMessages}
                        </span>
                        )}
                    </Button>
                </DrawerTrigger>

                {/* Drawer Content */}
                <DrawerContent className="h-5/6 bg-gray-100 shadow-lg rounded-lg">
                    <ChatBox/>
                </DrawerContent>
            </Drawer>
            <Button variant="destructive" onClick={endMeetingAction} size="icon"
                    className={`text-white  rounded-full size-16  mr-6  `}>
                {/*{loading ? <Loader className="size-6 md:size-5 animate-spin"/> :*/}
                {/*<Phone className="h-7 rotate-[137deg] w-7"/>*/}
                <svg width="40" height="40" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7.99348 26.3053C7.65521 25.9648 7.38322 25.5396 7.20576 25.0393C7.0283 24.539 6.91693 24.0107 6.89058 23.4355C6.84669 22.4642 6.99106 21.5879 7.33318 20.7782C7.66585 19.978 8.15857 19.2442 8.82075 18.5865C9.78563 17.628 11.0422 16.8309 12.5905 16.2138C14.1388 15.5967 15.8468 15.1405 17.7051 14.8544C19.5823 14.5684 21.4873 14.424 23.4389 14.4211C25.3905 14.4371 27.2944 14.5943 29.1508 14.8928C30.9977 15.2007 32.6932 15.6589 34.2091 16.2768C35.7343 16.9042 36.9856 17.7098 37.9628 18.6936C38.6017 19.3369 39.099 20.0645 39.4357 20.8576C39.7819 21.6601 39.9486 22.5469 39.9171 23.5179C39.9036 24.7153 39.5328 25.6663 38.8327 26.3616C38.5679 26.6247 38.2466 26.831 37.8974 26.9524C37.5387 27.0832 37.152 27.1291 36.7374 27.0523L31.4701 26.1389C31.0649 26.0716 30.7258 25.9761 30.434 25.8526C30.1515 25.7385 29.9069 25.5868 29.7284 25.4071C29.5028 25.1801 29.3435 24.8873 29.2599 24.5382C29.1667 24.1984 29.1209 23.7929 29.1225 23.3403L29.0991 21.8789C29.0998 21.6715 29.0249 21.5015 28.8746 21.3502C28.7994 21.2745 28.7242 21.2177 28.6301 21.1608C28.5265 21.1133 28.4418 21.0847 28.3665 21.0467C27.8861 20.9037 27.1888 20.7882 26.284 20.7098C25.3697 20.6407 24.4176 20.5904 23.4277 20.5776C22.4189 20.5837 21.4665 20.6088 20.5423 20.6811C19.637 20.7535 18.9483 20.8737 18.4576 21.023C18.3915 21.051 18.3065 21.079 18.2121 21.1164C18.1083 21.1632 18.0232 21.2289 17.9381 21.3135C17.7772 21.4732 17.7106 21.6521 17.7099 21.8596L17.6957 23.2832C17.6942 23.7546 17.6457 24.1598 17.5408 24.4894C17.4548 24.838 17.303 25.1203 17.0665 25.3552C16.8868 25.5338 16.66 25.6839 16.3673 25.8054C16.0747 25.927 15.7349 26.0202 15.3387 26.0943L9.99941 26.9815C9.58432 27.0555 9.21672 27.026 8.87776 26.8929C8.54825 26.7503 8.25658 26.5702 7.99348 26.3053Z"
                        stroke="white" stroke-width="1.5" stroke-miterlimit="10"/>
                </svg>
            </Button>
    </motion.div>
)
}
