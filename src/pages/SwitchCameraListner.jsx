import {
    useMeeting,
    usePubSub,
    createCameraVideoTrack,
} from "@videosdk.live/react-sdk";
// import { useMeetingAppContext } from "../context/MeetingAppContext";
import {useEffect, useRef, useState} from "react";
import {lowerCase} from "lodash";
import {useDispatch, useSelector} from "react-redux";
import {setBackCameraDevice, setFrontCameraDevice} from "/src/slices/socket.js";
// import useMediaStream from "../hooks/useMediaStream";

const SwitchCameraListner = () => {
    const [webcams, setWebcams] = useState([]);
    const webcamsRef = useRef();
    const dispatch = useDispatch();
    const {backCameraDevice, frontCameraDevice} = useSelector(state => state.SocketHandle)
    // const [frontCameraDevice, setFrontCameraDevice] = useState(null);
    // const [backCameraDevice, setBackCameraDevice] = useState(null);
    const mMeeting = useMeeting();
    useEffect(() => {
        webcamsRef.current = webcams;
    }, [webcams]);

    async function getWebcams() {
        const getVideoDevices = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === "videoinput");
            setWebcams(videoDevices);
            videoDevices.forEach((device) => {
                console.log(device.kind + ": " + device.label, device?.deviceId, 'messae');
            });
            videoDevices.forEach((device) => {
                if (device?.label?.includes("front")) {
                    dispatch(setFrontCameraDevice(device?.deviceId))
                } else {
                    dispatch(setBackCameraDevice(device?.deviceId))
                }
                ;
            });
        };
        getVideoDevices();
    }


    useEffect(() => {
        getWebcams();
    }, []);


    usePubSub(`SWITCH_PARTICIPANT_CAMERA_${'USER'}`, {
        onMessageReceived: async (data) => {
            if (mMeeting?.localParticipant?.id !== data?.senderId) {
                const {message} = data;
                let customTrack;

                const deviceId = message?.facingMode === 'FRONT' ? frontCameraDevice : backCameraDevice
                console.log("message", message, deviceId);

                try {
                    customTrack = await createCameraVideoTrack({
                        cameraId: deviceId,
                        facingMode: message.facingMode === 'FRONT' ? 'user' : 'environment',
                        optimizationMode: "motion",
                        multiStream: false,
                        encoderConfig: "h480p_w640p"
                    });
                    console.log(customTrack,'cus')
                    mMeeting.changeWebcam(customTrack);
                } catch (error) {
                    console.log("error in creating custom video track", error);
                }


            }
        },
    });

    return <></>;
};

export default SwitchCameraListner;





