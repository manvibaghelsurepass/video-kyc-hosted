import { Button } from "/src/components/ui/button"
import { Camera, GlobeLock, Info, MapPinned, Mic, Wifi } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "/src/components/ui/use-toast"
import { cn } from "/src/lib/utils.js";
import { useNavigate } from "react-router-dom";
import { BiSolidCheckCircle } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { getNetworkStats } from "@videosdk.live/react-sdk";
import surepassLogo from '/src/assets/surepassLogo.png'
import darkSPLogo from '/src/assets/White-Surepass-Logo.png'
import { useDispatch, useSelector } from "react-redux";
import { setHeartbeat, setUserGeoLocation } from "/src/slices/socket.js";
import { setAgentMeetingId, setCustomerScript, setToken } from "/src/slices/appSlice.js";
import axios from "axios";
import CameraIcon from '../assets/CameraIcon.svg';  // For SVG files
import Lottie from "lottie-react"; // Import Lottie (for the animation)
import { BiCheckCircle } from 'react-icons/bi';
import Check from "/src/assets/svg/Check.jsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"
import { AlertTriangle, RefreshCcw, Settings } from 'lucide-react'
import Cameraicon from "/src/assets/svg/Cameraicon.jsx";
import Micicon from "/src/assets/svg/Micicon.jsx";
import Locationicon from "/src/assets/svg/Locationicon.jsx";
import Bandwidth from "/src/assets/svg/Bandwidth.jsx";
import Vpnicon from "/src/assets/svg/Vpnicon.jsx";
import Precheckdailoge from "/src/components/svg/Meetingview/Precheckdailoge.jsx";

export default function PreCheckPermission(props) {

    const [showDialog, setShowDialog] = useState(false);
    const { t } = useTranslation();
    const [accessDenied, setAccessDenied] = useState(false);
    const { replaySession, socketsEvent } = useSelector(state => state.SocketHandle)
    const [camera, setCamera] = useState(false);
    const [VPNDetected, setVPNDectected] = useState(true);
    const [VPNCheck, setVPNCheck] = useState(false);
    const [vpnCheckLoader, setVpnCheckLoader] = useState(false);
    const [VPNDetectedBtnDisabled, setVPNDectectedBtnDisabled] = useState(false);
    const [mic, setMic] = useState(false);
    const [locationAllow, setLocationAllow] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast()
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [speed, setSpeed] = useState(null);
    const [error, setError] = useState(null)
    const [SpeedCheckLoading, setSpeedCheckLoading] = useState(false);
    const { theme } = useSelector(state => state.appSlice);
    const { permissionsInterfaceBlockId, socket, heartbeatId } = useSelector(state => state.SocketHandle);
    const { queryParams, token, queryStrings } = useSelector(state => state.appSlice);
    const dispatch = useDispatch();
    const [isVPNDivDisabled, setIsVPNDivDisabled] = useState(false);
    const [micAccessGranted, setMicAccessGranted] = useState(false);
    const [borderColor, setBorderColor] = useState('border-blue-300');
    const checkInternetSpeed = async () => {
        setSpeedCheckLoading(true);
        try {
            const options = { timeoutDuration: 45000 }; // Set a custom timeout of 45 seconds
            const networkStats = await getNetworkStats(options);
            setSpeed(networkStats["downloadSpeed"])
            console.log("Speed Download Speed: ", networkStats["downloadSpeed"]);  // will return value in Mb/s
            console.log("Speed Upload Speed: ", networkStats["uploadSpeed"]); // will return value in Mb/s
            setSpeedCheckLoading(false);
        } catch (ex) {
            setSpeedCheckLoading(false);
            console.log("Error in networkStats: ", ex);
        }
    };
    const handleLocationAccess = (e) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("Retrieved coordinates:", latitude, longitude);

                    dispatch(setUserGeoLocation({ latitude, longitude }));
                    setLocation({ latitude, longitude });
                    if (isInIndia(latitude, longitude)) {
                        console.log("User is in India, setting locationAllow to true");
                        setLocationAllow(true);
                    } else {
                        console.log("User is outside India, setting locationAllow to false");
                        setLocationAllow(false); // Explicitly set false here
                        toast({
                            className: cn("size-2/7 md:max-w-[420px]"),
                            variant: "destructive",
                            title: (<h1>Outside India</h1>),
                            description: "Your geolocation indicates you are outside India.",
                        });
                    }9
                },
                (error) => {
                    setError(error)
                }
            );
        } else {
            toast({
                className: cn("size-2/7 md:max-w-[420px]"),
                variant: "destructive",
                title: (<h1>Permission Denied</h1>),
                description: "Geolocation is not supported by this browser.",
            });
            console.log('Geolocation is not supported by this browser.');
        }
    };
    console.log("QueryStrings", queryStrings);
    const isInIndia = (lat, lon) => {
        const indiaBoundary = {
            north: 35.4940095078,
            south: 7.96553477623,
            west: 68.1766451354,
            east: 97.4025614766,
        };
        return (
            lat >= indiaBoundary.south &&
            lat <= indiaBoundary.north &&
            lon >= indiaBoundary.west &&
            lon <= indiaBoundary.east
        );
    };
    const handleMicAccess = async () => {
        try {
            // Request microphone access
            // const constraints = type === "mic" ? { audio: true } : { video: true };
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            audioRef.current = stream?.active;
            setMic(true)
        } catch (err) {
            console.log("handleMicAccess",err);     
                    setError({ error: `${error} Error accessing microphone. Please check your browser permissions.` });
            console.log(err, 'Error accessing the microphone');
        }
    };
    const handleCameraAccess = async () => {
        try {
          setLoading(true); //Start loading
          setButtonDisabled(true); // Disable the button during the process
      
          // If the camera is already enabled, simply return
          if (camera) {
            console.log("Camera is already enabled");
            return;
          }
          // Request camera access
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          
          // Set the video reference to the active state of the stream
          videoRef.current = stream?.active;
          // Set camera to true
          setCamera(true);
        } catch (err) {
          // Display error toast
          setError({ error: `${error}Permission Denied` });

        } finally {
          // Reset loading and button state once done
          setLoading(false);
          setButtonDisabled(false); // Re-enable the button if needed
        }
      };

    const checkVPNStatus = async () => {
        setVpnCheckLoader(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SUPERFLOW_BASE_URL}/api/v1/vkyc/admin/vpn-check`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_VPN_CHECK_TOKEN}`
                    }
                })
            const result = response?.data
            if (result) {
                setVPNDectected(result?.data?.vpn_status)
                if (result?.data?.vpn_status) {
                    toast({
                        className: cn("size-2/7 md:max-w-[420px]"),
                        variant: "destructive",
                        title: (<h1>VPN Detected: Please disable your VPN to continue.</h1>),
                        description: "Error checking the VPN.",
                    });
                    setVPNDectectedBtnDisabled(false)
                    setVPNCheck(false)
                } else {
                    setVPNCheck(true)
                    setVPNDectectedBtnDisabled(true)
                }
            }
        } catch (err) {
            setVPNCheck(false)
            toast({
                className: cn("size-2/7 md:max-w-[420px]"),
                variant: "destructive",
                title: (<h1>
                    {err.response.data.status_code} {err.response.data.message}
                </h1>),
                description: "Error checking the VPN.",
            });
        } finally {
            setVpnCheckLoader(false);
        }
    }
    const isUserFinalBlockPresentInMessage = useMemo(() => {
        if (replaySession?.message) {
            const messages = replaySession?.message || []
            if (messages.length) {
                return messages.some(item => item.data?.interaction_type == 'HEARTBEAT' && item.data?.interface_block_id == 'wait_for_userjoin_final');
            }
            return false;
        }
    }, [replaySession]);

    const isUserFinalBlockNotPresentInInteraction = useMemo(() => {
        if (replaySession?.interactions) {
            console.log('Replay Session', replaySession);
            return replaySession?.interactions?.some(item => item.data?.interaction_type == 'HEARTBEAT' && item.data?.interface_block_id !== 'wait_for_userjoin_final');
        }
        return false;
    }, [replaySession]);
    const userFinalBlock = useMemo(() => {
        if (replaySession?.messages) {
            return replaySession?.messages?.find(item => item.data?.message?.interaction_type == 'HEARTBEAT' && item.data?.interface_block_id == 'wait_for_userjoin_final' && item?.data?.message?.message_type == 'HINT');
        }
        return null;
    }, [replaySession]);
    const isMeetingBlockPending = useMemo(() => {
        if (replaySession?.messages) {
            return replaySession?.messages?.find(item => item?.data?.message?.message_type == 'HINT' && item?.data?.message?.interaction_type == 'PROMPT_INPUT' && item?.data?.message?.action === 'NAVIGATE_TO_MEETING');
        }
        return false
    }, [replaySession]);
    const isMeetingBlockCompleted = useMemo(() => {
        if (replaySession?.interactions) {
            return replaySession?.interactions?.find(item => item?.data?.interaction_type == 'PROMPT_INPUT' && item?.data?.action === 'ACCEPTED');
        }
        return false
    })
    console.log("Is Meeting Block", isMeetingBlockPending, isMeetingBlockCompleted, replaySession)
    console.log(audioRef.current, speed, VPNDetected, videoRef.current, Object.keys(location || {}).length, 'STATUS')

    return (
        <div className={'relative z-50  flex justify-center mb-12 overflow-hidden'}>
            {/* // <div className={'relative z-50 flex justify-center mb-10'}> */}
            <div
                className=" fixed flex flex-col max-w-md justify-between  -mt-3.5  min-h-[80dvh] bg-background p-7 gap-3   rounded-md   sm:px-6 fixed lg:px-8">
                <div className="w-full space-y-3 ">
                    <img src={theme === 'dark' ? darkSPLogo : surepassLogo} alt="" className={'h-7'}/>

                    <div className="-mt-10  space-x-1 text-center  ">
                        <h1 className="text-xl font-medium font-poppin tracking-tight text-center md:text-2xl text-card-foreground">
                            {t("Access Requirements")}
                        </h1>
                        <p className="mt-1 text-sm text-center font-poppin text-muted-foreground">
                            {t("to proceed with this journey, need to" +
                                " validate your permission and location")}
                        </p>
                    </div>
                    <div
                        className="hidden block w-full transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                        <div className="max-w-screen-xl mx-auto rounded-lg ">
                            <div
                                className="px-4 py-1  rounded-[7px] transition-colors duration-300 hover:bg-opacity-90 bg-blue-50">
                                <div
                                    className="flex items-center justify-between gap-4 text-sm font-medium text-blue-600">
                                    <div className="flex items-center gap-3  ">
                                        <div
                                            className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                            <Info className="w-4 h-4 text-blue-600"/>
                                        </div>
                                        <p className="text-sm font-medium text-blue-600 ">
                                            Please click the 'Start Recording' button before proceeding to read the
                                            consent.npm
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`flex items-center justify-between p-3 gap-4    border ${camera ? "border-blue-600 opacity-90" : "border-blue-300 opacity-95"
                        } rounded-sm shadow-sm cursor-pointer opacity-100 ${camera ? "pointer-events-none opacity-95" : "opacity-100"
                        }`} // Add pointer-events-none and reduce opacity when camera is enabled
                        onClick={!camera ? handleCameraAccess : undefined} // Disable click handler if camera is enabled
                    >
                        <div className="flex items-center gap-3 ">
                          <Cameraicon/>
                            <div>
                                <p className="flex gap-5 text-black font-poppin text-md font-medium">
                                    {t("preCheckPageCameraAccessTitle")}
                                    {camera}
                                </p>
                                <p className="text-xs gap-3 font-poppin  font-400 mt-0.5 text-muted-foreground">
                                    {t("Enable camera for video.")}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline border-0 text-primary opacity-95"
                            disabled={camera || videoRef.current}
                            onClick={handleCameraAccess}
                            className="text-primary opacity-95 "
                        >
                            {camera ? <Check/>

                                : t("accessBtn")}
                        </Button>
                    </div>
                    <div
                        className={`flex items-center justify-between gap-2 p-3 border rounded-sm shadow-sm ${mic ? "border-blue-600 pointer-events-none opacity-95" : "border-blue-300 cursor-pointer"
                        }`} // Make div clickable only when mic access is not granted
                        onClick={mic || audioRef.current ? undefined : handleMicAccess} // Only trigger mic access if mic is not granted or audio is not playing
                    >
                        <div className="flex items-center gap-3">
                          <Micicon/>
                            <div>
                                <p className="flex gap-2 text-md font-poppin text-black  font-medium">
                                    {t("preCheckPageMicAccessTitle")}
                                    {mic && (
                                        <BiSolidCheckCircle size={1} className="text-green-800 "/>
                                    )}
                                </p>
                                <p className="text-xs font-poppin mt-0.5 font-400 text-muted-foreground">
                                    {t("Enable mic for audio.")}
                                </p>
                            </div>
                        </div>
                        {/* The Button */}
                        <Button
                            variant="outline border-0 text-primary opacity-95"
                            disabled={mic || audioRef.current} // Disable button when mic access is granted
                            onClick={handleMicAccess} // Handle click when mic access is granted
                            className="text-primary opacity-100"
                        >
                            {mic ? (
                                <>
                                   <Check/>
                                    {t()}
                                </>
                            ) : (
                                t("accessBtn")
                            )}
                        </Button>
                    </div>
                    <div
                        className={`flex items-center justify-between gap-2 p-3 border rounded-sm shadow-sm mb-7 cursor-pointer ${locationAllow ? "border-blue-600 pointer-events-none opacity-95" : "border-blue-300"
                        }`}
                        onClick={handleLocationAccess} // Trigger location access when the whole div is clicked
                    >
                        <div className="flex items-center gap-3">
                            <Locationicon/>
                            <div>
                                <p className="flex gap-5 text-md font-poppin text-black  font-medium">
                                    {t("preCheckPageLocationAccessTitle")}
                                    {locationAllow && (
                                        <BiSolidCheckCircle size={1} className="text-green-500"/>
                                    )}
                                </p>
                                <p className="text-xs font-poppin font-normal mt-0.5 text-muted-foreground h-5 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {t("required to confirm your location.")}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline border-0"
                            disabled={Object.keys(location || {}).length || locationAllow} // Disable button when location is granted
                            onClick={handleLocationAccess}
                            className="text-primary"
                        >
                            {locationAllow ? (
                                <>
                                   <Check/>
                                    {t("")}
                                </>
                            ) : (
                                t("accessBtn")
                            )}
                        </Button>
                    </div>


                    <div
                        className={`flex items-center justify-between gap-2 p-3 mt-2 border rounded-sm shadow-sm cursor-pointer 
                ${speed ? "border-blue-600" : "border-blue-300"} 
                ${SpeedCheckLoading || speed ? "opacity-100 pointer-events-none" : ""}`}
                        onClick={checkInternetSpeed}
                    >
                        <div className="flex items-center gap-3">
                           <Bandwidth/>
                            <div>
                                <p className="flex gap-5 text-md font-poppin text-black font-400  font-medium">
                                    {t("preCheckPageBandwidthCheckTitle")}
                                    {speed && <BiSolidCheckCircle size={1} className="text-blue-400"/>}
                                </p>
                                <p className="text-xs font-poppin font-normal mt-0.5 text-muted-foreground">
                                    {t("to ensure stable connection.")}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline border-0"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent parent onClick from triggering
                                checkInternetSpeed();
                            }}
                            disabled={speed || SpeedCheckLoading}
                            className="text-primary flex items-center justify-center"
                        >
                            {SpeedCheckLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin h-7 w-7 text-green-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <circle
                                            className="opacity-95"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeDasharray="80"
                                            strokeDashoffset="60"
                                        ></circle>
                                    </svg>
                                </div>
                            ) : speed ? (
                                <>
                                    <Check/>
                                </>
                            ) : (
                                t("check")
                            )}
                        </Button>
                    </div>
                    <div
                        className={`flex items-center justify-between gap-2 p-3 mt-2 border rounded-sm shadow-sm cursor-pointer ${VPNDetected ? "border-blue-300" : "border-blue-500"
                        }`}
                        onClick={checkVPNStatus} // Trigger the checkVPNStatus on click
                    >
                    <div className="flex items-center gap-3">
                           <Vpnicon/>
                            <div>
                                <p className="flex gap-5 text-md font-poppin text-black font-400  font-medium">
                                    {t("preCheckPageVPNCheckTitle")}
                                    {VPNCheck && <BiSolidCheckCircle size={1} className="text-blue-400"/>}
                                </p>
                                <p className="text-xs font-poppin font-normal mt-0.5 text-muted-foreground">
                                    {t("to ensure stable connection")}
                                </p>
                            </div>
                        </div>
                        <div className="ml-auto">
                            <Button
                                variant="outline border-0"
                                disabled={VPNDetectedBtnDisabled}
                                onClick={checkVPNStatus}
                                className="text-primary ml-3"
                            >
                                {VPNDetected ? (
                                    "Check"
                                ) : (
                                    <Check/>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
                <footer className={'flex flex-col gap-3'}>
                    {!(speed && !VPNDetected && audioRef.current && videoRef.current && Object.keys(location || {}).length) && (
                        <div className="flex items-center justify-center gap-2 text-red-500">
                            <CircleXIcon className="w-4 h-4"/>
                            <span className="text-xs font-normal">{t("allNotSet")}</span>
                        </div>
                    )}
                    <Button
                        disabled={!(audioRef.current && !VPNDetected && speed && videoRef.current && Object.keys(location || {}).length)}
                        onClick={() => {
                            if (audioRef.current && !VPNDetected && speed && videoRef.current && Object.keys(location || {}).length) {
                                if (socket && userFinalBlock && isUserFinalBlockNotPresentInInteraction && !queryStrings?.type) {
                                    console.log("User Final Block", userFinalBlock, isUserFinalBlockNotPresentInInteraction);
                                    dispatch(setHeartbeat(userFinalBlock?.data?.interface_block_id));
                                    socket.emit("interface_interaction", {
                                        "interaction_type": userFinalBlock?.data?.message?.interaction_type,
                                        "interface_block_id": userFinalBlock?.data?.interface_block_id,
                                    });
                                }
                                if (socket && !queryStrings?.type && !isUserFinalBlockNotPresentInInteraction) {
                                    socket.emit("interface_interaction", {
                                        "interaction_type": "HEARTBEAT",
                                        "interface_block_id": heartbeatId,
                                    });
                                }
                                if (token && queryStrings?.type == 'unassisted') {
                                    if (isMeetingBlockCompleted) {
                                        dispatch(setAgentMeetingId(isMeetingBlockCompleted?.data?.message?.parameters?.meeting_room_id));
                                        dispatch(setToken(isMeetingBlockCompleted?.data?.message?.parameters?.authorization_token));
                                        dispatch(setCustomerScript(isMeetingBlockCompleted?.data?.message?.parameters?.customer_script));
                                    } else if (isMeetingBlockPending) {
                                        socket.emit('interface_interaction', {
                                            "interaction_type": isMeetingBlockPending?.data?.message?.interaction_type,
                                            "interface_block_id": isMeetingBlockPending?.data?.interface_block_id,
                                            "action": isMeetingBlockPending?.data?.message?.action
                                        });

                                    } else {
                                        const lastMessageSocket = socketsEvent[socketsEvent?.length - 1];
                                        const isSend = replaySession?.interactions?.find(item => item?.data?.interface_block_id == lastMessageSocket?.data?.interace_block_id);
                                        if (!isSend) {
                                            socket.emit("interface_interaction", {
                                                "interaction_type": lastMessageSocket?.data?.message?.interaction_type,
                                                "interface_block_id": lastMessageSocket?.data?.interface_block_id,
                                            })
                                        }
                                    }
                                    navigate('/meeting');
                                } else {
                                    console.log("Joining", token, isMeetingBlockPending, isMeetingBlockCompleted)
                                    navigate('/joining');
                                }
                            }
                        }}
                        className="fixed w-full h-11  text-base py-3 mt-6 transition duration-300  flex items-center justify-center bottom-6 left-1/2 transform -translate-x-1/2 w-80 px-8 py-4 text-lg bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:outline-none active:bg-primary sm:py-4 sm:px-6 sm:text-sm"
                        variant="ghost"
                    >
                        {t("ConnectBtn")}
                    </Button>

                </footer>
                <CameraAccessDialog error={error}/>
            </div>
        </div>
    )
}
function CircleCheckIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

function CircleXIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    )
}
export function CameraAccessDialog({error}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const dispatch = useDispatch();
 console.log("error",error);
 
    useEffect(() => {
        if(error){
            setIsDialogOpen(true)
        }
      
    }, [error])
    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-sm  max-w-full  my-4 w-11/12 h-auto max-h-[80vh]">
                    <DialogHeader>
                        <div className="flex items-center justify-between ml-9 ">
                            <DialogTitle className="text-xl font-normal ">
                               <span className="font-semibold "> Oops!</span> Camera Access Required
                            </DialogTitle>
                            {/* <AlertTriangle className="w-8 h-8 text-yellow-500" /> */}
                        </div>
                    </DialogHeader>
                    <div className="py-1 space-y-2 ">
                        {/* First section: Browser Settings */}
                        <div className="flex gap-2 mb-1">
                            <div className="flex items-center justify-center w-12 h-12  rounded-full">
                                {/* <Settings className="w-7 h-7 text-blue-500" /> */}
                                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#3783F4" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2 12.8814V11.1214C2 10.0814 2.85 9.2214 3.9 9.2214C5.71 9.2214 6.45 7.9414 5.54 6.3714C5.02 5.4714 5.33 4.3014 6.24 3.7814L7.97 2.7914C8.76 2.3214 9.78 2.6014 10.25 3.3914L10.36 3.5814C11.26 5.1514 12.74 5.1514 13.65 3.5814L13.76 3.3914C14.23 2.6014 15.25 2.3214 16.04 2.7914L17.77 3.7814C18.68 4.3014 18.99 5.4714 18.47 6.3714C17.56 7.9414 18.3 9.2214 20.11 9.2214C21.15 9.2214 22.01 10.0714 22.01 11.1214V12.8814C22.01 13.9214 21.16 14.7814 20.11 14.7814C18.3 14.7814 17.56 16.0614 18.47 17.6314C18.99 18.5414 18.68 19.7014 17.77 20.2214L16.04 21.2114C15.25 21.6814 14.23 21.4014 13.76 20.6114L13.65 20.4214C12.75 18.8514 11.27 18.8514 10.36 20.4214L10.25 20.6114C9.78 21.4014 8.76 21.6814 7.97 21.2114L6.24 20.2214C5.33 19.7014 5.02 18.5314 5.54 17.6314C6.45 16.0614 5.71 14.7814 3.9 14.7814C2.85 14.7814 2 13.9214 2 12.8814Z" stroke="#3783F4" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Go to browser Settings</h3>
                                <p className="text-sm text-gray-500">Open your browser or app settings.</p>
                            </div>
                        </div>
                        {/* Second section: Microphone Permission */}
                        <div className="flex gap-2 mt-2 ">
                            <div className="flex items-center justify-center w-12 h-12   rounded-full ">
                                {/* <Mic className="w-7 h-7 text-blue-500" /> */}
                              <Precheckdailoge/>
                            </div>
                            <div>
                                <h3 className="text-md font-semibold mt-1">  Camera Permission</h3>
                                <p className="text-sm text-gray-500">Please ensure the microphone is enabled.</p>
                            </div>
                        </div>
                        {/* Third section: Return Action */}
                        <div className="flex gap-2 mt-2">
                            <div className="flex items-center justify-center w-12 h-12  rounded-full mt-1">
                                {/* <RefreshCcw className="w-6 h-6 text-blue-500" /> */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#3783F4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17.5 12C17.5 15.04 15.04 17.5 12 17.5C8.96 17.5 7.10999 14.44 7.10999 14.44M7.10999 14.44H9.59M7.10999 14.44V17.19M6.5 12C6.5 8.96 8.94 6.5 12 6.5C15.67 6.5 17.5 9.56 17.5 9.56M17.5 9.56V6.81M17.5 9.56H15.06" stroke="#3783F4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                            </div>
                            <div>
                                <h3 className="text-md font-semibold  mt-2">Return</h3>
                                <p className="text-sm text-gray-500">Return here and proceed.</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}










