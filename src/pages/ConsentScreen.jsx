import React, { useEffect } from 'react';
import {Button} from '/src/components/ui/button.jsx';
import {Checkbox} from '/src/components/ui/checkbox.jsx';
import {Info} from "lucide-react";
import {useSelector, useDispatch} from "react-redux";
import {usePubSub,useMeeting} from "@videosdk.live/react-sdk";
import axios from "axios";
import {setAgentMeetingId, setRecording, setToken, setUserParticipantId} from "/src/slices/appSlice.js";

const VideoCallConsent = (props) => {
    const {leave, toggleMic, toggleWebcam, startRecording, end, stopRecording, getWebcams, changeWebcam} = useMeeting();
    const {hasConsented, setShowConsent, setHasConsented, setShowConsentReview, showConsent} = props;
    const dispatch =  useDispatch();
    const {mode, webhook,agentMeetingId,token,customerScript,customerOrganizationName, queryParams, recording, queryStrings, vkycSessionKey} = useSelector((state) => state.appSlice);
    const {transcriptData, highlightedText} = useSelector(state=>state.SocketHandle);


    const {publish: endMeeting} = usePubSub(`ENDMEETING`, {
        onMessageReceived: async (data) => {
            dispatch(setAgentMeetingId(null))
            dispatch(setToken(null));
        }
    });

    const handleConsent = () => {
        setHasConsented(true);
        dispatch(setAgentMeetingId(null))
        dispatch(setToken(null));
        stopRecording();
        endMeeting('ENDMEETING');
    };


    const ConsentContent = ({isReview = false}) => (
        <div className="space-y-2">
            <div className="space-y-2">
                <h2 className="text-2xl my-1 text-center font-bold text-black">
                    Consent Statement
                </h2>
            </div>
            <div className=" text-sm text-gray-300">
                <p className={'text-black leading-6'}>
                    {customerScript}
                </p>
            </div>
            {/*<div className="w-full flex gap-x-2   pt-4">*/}
            {/*            <Button*/}
            {/*                onClick={handleConsent}*/}
            {/*                disabled={hasConsented}*/}
            {/*                className="bg-blue-600 w-full hover:bg-blue-700"*/}
            {/*            >*/}
            {/*                {hasConsented ?'Agreed' : 'Agree' }*/}

            {/*            </Button>*/}
            {/*</div>*/}
        </div>
    );

    return (
        <div className=" w-full overflow-y-auto">
            <ConsentContent isReview={false}/>
        </div>
    );
};

export default VideoCallConsent;
