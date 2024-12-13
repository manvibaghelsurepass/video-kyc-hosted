import {useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {Constants, useMeeting, useParticipant, usePubSub, useTranscription} from "@videosdk.live/react-sdk";
import {lowerCase, startCase} from "lodash";
import {motion} from "framer-motion";
import {Button} from "/src/components/ui/button";
import {Badge} from "/src/components/ui/badge";
import ovalFace from "/src/assets/Oval Cutout (1).png"
import rectangleDocument from "/src/assets/Rectangle Cutout (1).png"
import {setAgentMeetingId, setRecording, setToken, setUserParticipantId} from "/src/slices/appSlice.js";
import VideoCallConsent from "/src/pages/ConsentScreen.jsx";
import {Card} from "/src/components/ui/card.jsx";
import {
    setHighlightedText,
    setRecordingLoader,
    setRecordingState,
    setSuccessMatchWords, setUnassistedParameters,
    setUserGeoLocation
} from "/src/slices/socket.js";

import {Camera, CameraOff, Loader, Mic, MicOff, Phone, SwitchCamera} from "lucide-react";
import {FaRegDotCircle} from "react-icons/fa";
import axios from "axios";
import CornerDisplayName from "../BandwidthCheck";
import {ScrollArea} from "/src/components/ui/scroll-area.jsx";


function ParticipantView({participantId, isMobile = false, setIsRecorded}) {
    const micRef = useRef(null);
    const webcamRef = useRef(null);
    const {mode} = useSelector((state) => state.appSlice);
    const [showMessage, setShowMessage] = useState('none');
    const dispatch = useDispatch();
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

    const { recording } = useSelector((state) => state.appSlice);

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

    return (
        <motion.div
            key={participantId}
            className={`${participantId !== 'AGENT' ? `w-full relative h-full` : `absolute md:bottom-24 bottom-[120px] w-40 sm:w-36 right-3 h-48 ${mode !== 'AGENT' && 'top-4 right-6'} ${mode === 'USER' && participantId === 'USER' ? 'rounded-none' : 'rounded-2xl'} overflow-hidden shadow-md z-50`}`}
            initial={{opacity: 0, scale: 0.8}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.3}}
        >


            {participantId !== 'AGENT' && mode === 'USER' && webcamOn && showMessage !== 'none' &&
                <img src={showMessage === 'oval' ? ovalFace : showMessage === 'rectangle' ? rectangleDocument : 'none'}
                     className={'absolute w-screen h-screen'}/>}
            <audio id="audio" ref={micRef} autoPlay muted={isLocal}/>
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
            <div>
                <motion.div
                    className={`absolute ${participantId === 'AGENT' ? `bottom-0 ${mode === 'USER' && 'top-0 right-0'}` : 'top-2 left-2'} p-1 left-0 bg-transparent bg-opacity-90 w-fit rounded-2xl`}
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: 0.1}}
                >
                    <div className="flex items-center space-x-2 bg-secondary rounded-2xl px-3 py-1">
                        <div>
                            <h3 className="font-semibold text-secondary-foreground text-sm">{startCase(lowerCase(displayName))}</h3>
                        </div>
                    </div>

                </motion.div>
                <div className={'absolute right-[10px]  z-10 gap-x-2 flex mt-2 justify-end'}>
                    {recording && (
                        <div className="flex items-center space-x-4">
                            <Badge
                                className={'rounded-full h-8 bg-destructive-foreground hover:bg-transparent  text-destructive z-10 left-8 top-12 text-xs flex gap-2'}><FaRegDotCircle
                                className={'size-4'}/> Recording</Badge>
                        </div>)
                    }
                </div>
            </div>


            {webcamOn ?
                <>
                    <video ref={webcamRef}
                           className={`w-full h-full ${isMobile ? 'rounded-none' : 'rounded-2xl'} object-cover `}
                           src="/placeholder.svg"/>


                </>
                :
                <div
                    className="w-full h-full bg-secondary dark:bg-card dark:text-card-foreground text-secondary-foreground flex items-center justify-center">
                    <div className="w-10 h-10 bg-card dark:bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-secondary-foreground">
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>}
        </motion.div>
    );

}

export default function UnassistedMeetingView({setJoined}) {
    const {
        userGeoLocation,
        successMatchWords,
        unassistedParameters,
        recordingState
    } = useSelector(state => state.SocketHandle);
    const {token} = useSelector((state) => state.appSlice);
    const dispatch = useDispatch();
    const [steps, setSteps] = useState([]);
    const [Base64, setBase64] = useState(null);
    const {t} = useTranslation();
    const [currentStep, setCurrentStep] = useState(0)
    const [showConsent, setShowConsent] = useState(true);
    const [hasConsented, setHasConsented] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isRecorded, setIsRecorded] = useState(false);
    const [recordingUrl, setRecordingUrl] = useState('');
    const matchedSet = useMemo(() => new Set(), []);
    const [showConsentReview, setShowConsentReview] = useState(false);
    const [recordingLoading, setRecordingLoading] = useState(false);
    const [record, setRecord] = useState(false);

    const {participants, startRecording, stopRecording} = useMeeting({
        onMeetingJoined: () => {
            setJoined("JOINED");
        },
        onRecordingStateChanged
    });

    const {
        mode,
        participantId,
        queryParams,
        recording,
    } = useSelector((state) => state.appSlice);

    const {publish: sendUserLocation} = usePubSub('SEND_USER_LOCATION', {
        onMessageReceived: async (data) => {
            dispatch(setUserGeoLocation(data?.payload))
        }
    })

    //Check mobile screen
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile)
    }, []);

    //Get recording video URL
    async function getRecordingVideo() {
        try {
            dispatch(setRecordingLoader(true));
            const response = await axios.post(`${import.meta.env.VITE_SUPERFLOW_BASE_URL}/api/v1/vkyc/unassisted/user/fetch-recording-session`, {
                vkyc_session_id: unassistedParameters?.vkyc_session_id,
                meeting_id: unassistedParameters?.meeting_room_id
            }, {
                headers: {
                    "Authorization": `Bearer ${unassistedParameters?.vkyc_session_token}`
                }
            });

            const data = await response.data?.data;
            if(data){
                dispatch(setRecordingLoader(false));
                setRecordingUrl(data?.video_assets?.recording_link);
            }



        } catch (error) {
            if(error.response?.data?.status_code === 401){
                dispatch(setRecordingLoader(false));
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setTimeout(()=>{
                 getRecordingVideo();
            },1000);
        }

    }

    useEffect(() => {
        sendUserLocation('SEND_USER_LOCATION', null, userGeoLocation);
    }, []);

    console.log("Recording Link URl", recordingUrl);

    const {captureImage, webcamStream, webcamOn} = useParticipant(participantId);

    async function imageCapture() {
        if (webcamOn && webcamStream) {
            const base64 = await captureImage({height: 2900, width: 2040}); // captureImage will return base64 string
            setBase64(base64)
        } else {
            console.error("Camera must be on to capture an image");
        }
    }

    //Transcript Config
    // const config = {
    //     summary: {
    //         enabled: true,
    //         prompt: "I"
    //     }
    // };

    // Callback function for transcription state change event
    function onTranscriptionStateChanged(data) {
        const {status, id} = data;

        if (status === Constants.transcriptionEvents.TRANSCRIPTION_STARTING) {
            console.log("Realtime Transcription is starting", id, data);
        } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STARTED) {
            console.log("Realtime Transcription is started", id);
        } else if (
            status === Constants.transcriptionEvents.TRANSCRIPTION_STOPPING
        ) {
            console.log("Realtime Transcription is stopping", id);
        } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STOPPED) {
            console.log("Realtime Transcription is stopped", id);
        } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_FAILED) {
            console.log("Realtime Transcription is failed", id);
        }
    }

    console.log("Unassisted", unassistedParameters);

    //Compare text logic for live audio speech recognition
    function compareText(transcript, statement, previousSuccessWords = []) {
        const transcriptWords = transcript.toLowerCase().split(/\s+/);
        const statementWords = statement.toLowerCase().split(/\s+/);
        const originalStatementWords = statement.split(/\s+/);
        let highlightedText = [];
        let persistentSuccessWords = new Set(previousSuccessWords);
        let transcriptIndex = 0;

        for (let i = 0; i < statementWords.length; i++) {
            // If already marked as success, keep it success
            if (persistentSuccessWords.has(i)) {
                highlightedText.push({
                    word: originalStatementWords[i],
                    status: "success"
                });
                continue;
            }

            // Not enough words spoken
            if (transcriptIndex >= transcriptWords.length) {
                highlightedText.push({
                    word: originalStatementWords[i],
                    status: "normal"
                });
                continue;
            }

            // Flexible matching with skipping on error
            let matchFound = false;
            while (transcriptIndex < transcriptWords.length) {
                if (statementWords[i] === transcriptWords[transcriptIndex]) {
                    highlightedText.push({
                        word: originalStatementWords[i],
                        status: "success"
                    });
                    persistentSuccessWords.add(i);
                    matchFound = true;
                    break;
                } else {
                    // Skip words that don't match
                    transcriptIndex++;
                }
            }

            // Mark as error if no match found
            if (!matchFound) {
                highlightedText.push({
                    word: originalStatementWords[i],
                    status: "error"
                });
            }
            transcriptIndex++;
        }

        return {
            highlightedText,
            successWords: Array.from(persistentSuccessWords)
        };
    }

    //Call on when user speak
    function onTranscriptionText(data) {
        const {text} = data;
        const customerScript = `Hello my name is shubhendu kumar aged.having address at burari in state delhi Owning the pan card number and aadhar number. Now, As per the direct selling rules 2021 ,I am interested to work as a direct seller in Asclepius Wellness Pvt Ltd to sell the products. I have carefully read and understood all the terms and conditions of the company's direct selling agreement and the company's mathematically calculated business plan and have also understood the company's products, their quality, refund policy, return policy, grievance mechanism etc. and now I am completely satisfied. I am also aware that I will get commission on further selling of the products which is directly sold by me and my appointed team or downline as per conditions of the business plan. Please accept my application for being direct seller of ASCLEPIUS WELLNESS PRIVATE LIMITED`;

        const previousSuccessWords = successMatchWords || [];

        const {highlightedText, successWords} = compareText(
            text,
            customerScript,
            previousSuccessWords
        );

        dispatch(setSuccessMatchWords(successWords));
        dispatch(setHighlightedText(highlightedText));
    }

    // Passing callback functions to useTranscription hook
    const {startTranscription} = useTranscription({
        onTranscriptionStateChanged,
        onTranscriptionText,
    });

    function onRecordingStateChanged(data) {
        const {status} = data;
        console.log("Status", status);
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

    // useEffect(() => {
    //     startTranscription(config);
    // }, []);

    const handleEndMeeting = (e) => {
        e.preventDefault();
        stopRecording();
        dispatch(setAgentMeetingId(null))
        dispatch(setToken(null));
        dispatch(setUnassistedParameters(null));
        end();
        localStorage.clear()

    }


    useEffect(() => {

        //Call an api for live recorded session video
        if (recordingState) {
            getRecordingVideo();
        }
    }, [recordingState]);

    return (
        <div className={`flex flex-col md:flex-row h-screen ${isMobile ? 'bg-white' : 'bg-secondary'} text-foreground`}>
            <div className={`w-full ${mode === 'AGENT' ? 'md:w-[40%]' : 'md:w-[100%] h-dvh'} md:p-4 flex flex-col`}>
                {!queryParams?.signature && <header className="md:flex hidden justify-between items-center mb-6">
                    <div>
                        {mode === 'AGENT' && <h1 className="text-2xl font-bold text-foreground">Video KYC Session</h1>}
                    </div>
                    <div className="flex items-center space-x-4">
                        {recording &&
                            <div className="flex items-center space-x-4">

                                <Badge
                                    className={'rounded-full h-8 bg-destructive text-destructive-foreground z-10 left-8 top-12 text-xs flex gap-2'}><FaRegDotCircle
                                    className={'size-4'}/>
                                    Recording</Badge>
                            </div>
                        }
                        {/*<ModeToggle/>*/}
                    </div>
                </header>}
                <div className={`flex flex-1 ${isMobile ? 'flex-col' : 'flex-row'} `}>
                    {isMobile ? (
                        <>
                            <div
                                className={`flex-1 transition-all duration-300 ease-in-out`}>
                                <div
                                    className="flex-1 h-full w-full sm:rounded-none md:rounded-3xl  overflow-hidden  md:p-3 shadow-lg bg-card text-card-foreground border border-border relative">
                                    {[...participants.keys()].map((participantId) => (<ParticipantView
                                        setIsRecorded={setIsRecorded}
                                        participantId={participantId}
                                        key={participantId}
                                        isMobile={isMobile}
                                        setRecord={setRecord}
                                        record={record}
                                    />))}
                                    <Controls setRecord={setRecord} record={record} setIsRecorded={setIsRecorded} recordingLoading={recordingLoading}
                                              isMobile={true}/>
                                </div>

                            </div>
                            <div className={'bg-white'}>
                                <ScrollArea className={'min-h-[500px] h-[300px] border p-2 mx-2 my-2 rounded'}>
                                    <div
                                        className="bg-card  text-card-foreground sm:rounded-none md:flex flex-col ">
                                        <div className="w-full h-full">
                                            <Card
                                                className="w-full border-none shadow-none h-full bg-white md:bg-white  sm:p-2 sm:space-y-6 md:p-0 ">
                                                <VideoCallConsent
                                                    showConsent={showConsent}
                                                    hasConsented={hasConsented}
                                                    setHasConsented={setHasConsented}
                                                    setShowConsent={setShowConsent}
                                                    showConsentReview={showConsentReview}
                                                />
                                            </Card>
                                            {recordingState && recordingUrl ?(
                                                <div className={'my-2 border-t '}>
                                                    <h1 className={'font-semibold my-1'}>Recorded Video</h1>
                                                    <div className={'w-full gap-x-2 flex justify-between items-center'}>
                                                        <div className={'w-full'}>
                                                            <video src={recordingUrl} className={'w-full h-full'}
                                                                   controls autoPlay/>
                                                        </div>

                                                    </div>
                                                </div>
                                            ):null}
                                        </div>

                                    </div>
                                </ScrollArea>
                                <div>
                                    <div className={'mx-2 flex items-center gap-2 my-2'}>
                                        {recordingState && (
                                            <Button className={'w-full'} onClick={() => {
                                                dispatch(setRecordingState(false))
                                                setRecordingUrl('');
                                                startRecording()
                                            }} variant={'outline'}>
                                                Retake
                                            </Button>
                                        )}

                                        <Button className={'w-full'} onClick={handleEndMeeting}>
                                            I Agree
                                        </Button>
                                    </div>

                                </div>
                            </div>

                        </>
                    ) : (
                        <>
                            <div className="flex-1  flex h-full justify-center">

                                <div
                                    className="flex-1 rounded-none md:rounded-3xl overflow-hidden  md:p-3 shadow-lg bg-card text-card-foreground border border-border relative">
                                    {[...participants.keys()].map((participantId) => (
                                        <ParticipantView
                                            setIsRecorded={setIsRecorded}
                                            isMobile={isMobile}
                                            setRecord={setRecord}
                                            record={record}
                                            participantId={participantId}
                                            key={participantId}
                                        />))}
                                    <Controls setIsRecorded={setIsRecorded} setRecord={setRecord} record={record} recordingLoading={recordingLoading}/>
                                </div>

                            </div>
                            <div
                                className="md:mx-2 sm:mx-0 md:w-[50%] sm:w-full h-full bg-card text-card-foreground sm:rounded-none md:rounded-3xl  h-full  p-6 md:flex flex-col ">
                                <div className="w-full h-full">
                                    <Card
                                        className="w-full border-none shadow-none h-full bg-white md:bg-white  sm:p-2 sm:space-y-6 md:p-0 ">
                                        <VideoCallConsent
                                            showConsent={showConsent}
                                            hasConsented={hasConsented}
                                            setHasConsented={setHasConsented}
                                            setShowConsent={setShowConsent}
                                            showConsentReview={showConsentReview}
                                        />
                                        {recordingState && recordingUrl? (
                                            <div className={'my-2 border-t'}>
                                                <h1 className={'font-semibold my-1'}>Recorded Video</h1>
                                                <div className={'w-full  gap-x-2 flex justify-between items-center'}>
                                                    <video src={recordingUrl} className={'w-full'} controls
                                                           autoPlay={true}/>
                                                </div>
                                            </div>
                                        ):null}
                                        <div className={'flex my-2 gap-x-2 justify-center'}>
                                            {recordingState && (
                                                <Button className={'w-full'} variant={'outline'}>
                                                    Retake
                                                </Button>
                                            )}


                                            <Button className={'w-full'} onClick={handleEndMeeting}>
                                                I Agree
                                            </Button>

                                        </div>
                                    </Card>

                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>)
}

export function Controls({recordingLoading, isMobile, setIsRecorded, setRecord, record}) {
    const {socket, terminateEvent, recordingState} = useSelector(state => state.SocketHandle)
    const {leave, toggleMic, toggleWebcam, startRecording, end, stopRecording, getWebcams, changeWebcam} = useMeeting();
    const mMeeting = useMeeting();
    const {
        mode,
        agentMeetingId,
        queryStrings,
    } = useSelector((state) => state.appSlice);

    const localMicOn = mMeeting?.localMicOn;
    const dispatch = useDispatch()
    const localWebcamOn = mMeeting?.localWebcamOn;
    const [loading, setLoading] = useState(false);
    const [cameraSwitch, setCameraSwitch] = useState(false);
    const [cameras, setCameras] = useState([]);

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



    useEffect(() => {
        handleGetWebcams();
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
        startRecording(null, null, config);
    };

    useEffect(() => {

        return () => {
            setLoading(true);
            if (record) {
                stopRecording();
            }
            const webHookUrl = 'https://superflow.surepass.io/api/v1/vkyc/unassisted/finished';
            axios.post(
                webHookUrl,
                {
                    meeting_id: agentMeetingId,
                    vkyc_session_id: queryStrings?.vkyc_session_id,
                }
            ).then(res => {
            }).catch(error => console.error('Error occurred during webhook post:', error.response ? error.response.data : error.message)).finally(() => setLoading(false));
        }
    }, []);

    return (<motion.div
        className={`absolute ${isMobile ? 'bottom-2' : 'bottom-6'} left-0 right-0 mx-auto w-fit flex space-x-2 bg-transparent px-4 py-3 rounded-3xl`}
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3, delay: 0.2}}
    >
        <Button
            variant={"outline"}
            size="icon"
            onClick={() => {
                toggleMic()
            }}
            className={`size-12 transition-colors duration-200 ${localMicOn ? 'bg-secondary text-secondary-foreground' : 'bg-gray-50 text-gray-600'} rounded-full`}
        >
            {localMicOn ? <Mic className="size-6 md:size-5"/> : <MicOff className="h-5 w-5"/>}
        </Button>
        <Button
            variant={ "outline"}
            size="icon"
            onClick={() => toggleWebcam()}
            className={`size-12 transition-colors duration-200 ${localWebcamOn ? 'bg-secondary text-secondary-foreground' : 'text-destructive-foreground'} rounded-full`}
        >
            {localWebcamOn ? <Camera className="size-6 md:size-5"/> : <CameraOff className="h-5 w-5"/>}
        </Button>
        <Button
            variant={"outline"}
            size="icon"
            disabled={recordingLoading}
            onClick={() => {

                //Manage recorded state
                setRecord(prev=>{
                    if(!prev){
                            dispatch(setRecordingState(false));
                            handleStartRecording();
                            return true;
                    }
                    dispatch(setRecordingState(true));
                    stopRecording();
                    return false;
                });

            }}
            className={`size-12 transition-colors duration-200  text-secondary-foreground rounded-full`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width={'30px'} height={'30px'} viewBox="0 0 24 24" fill="none"
                 class="lucide lucide-circle-dot">
                <circle cx="12" cy="12" r="11" className="fill-transparent"/>
                <circle cx="12" cy="12" r="5" className="fill-red-500"/>
            </svg>
        </Button>

        <Button onClick={() => {
            switchCameraPublish('SWITCH_PARTICIPANT_CAMERA_USER')
            // setCameraSwitch(!cameraSwitch)
        }} variant={'outline'} size="icon"
                className={`hidden bg-secondary text-secondary-foreground border border-border rounded-full size-12`}>
            <SwitchCamera className={'size-6 md:size-5'}/>
        </Button>

        <Button variant="destructive" onClick={() => {
            stopRecording();
            dispatch(setAgentMeetingId(null))
            dispatch(setToken(null));
            end();
            localStorage.clear()
            // window.parent.postMessage({action: 'closeIframe'}, '*');
        }} size="icon" className={`text-destructive-foreground bg-destructive rounded-full size-12`}>
            {loading ? <Loader className="size-6 md:size-5 animate-spin"/> :
                <Phone className="h-5 rotate-[137deg] w-5"/>}
        </Button>
    </motion.div>)
}
