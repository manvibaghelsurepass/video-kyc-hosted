import React, {useCallback, useEffect, useState} from "react";

// import CameraAccess from "/src/pages/CameraAccess.jsx";
import PreCheckPermission from "/src/pages/PreCheckPermission.jsx";
import VideoKYCFlow from "/src/pages/VideoKYCFlow.jsx";
import WaitScreen from "/src/pages/WaitScreen.jsx";
import MeetingContainer from "/src/pages/MeetingContainer.jsx";
import {useDispatch, useSelector} from "react-redux";
import AccessDeniedError from "/src/pages/ErrorComponent/ErrorPage.jsx";
import {
    setAgentMeetingId,
    setAgentName,
    setCustomerScript,
    setMode, setQueryParams,
    setQueryStrings,
    setToken,
    setWebhook
} from "/src/slices/appSlice.js";
import {setSocketEvents, setUnassistedParameters} from "/src/slices/socket.js";

import "./App.css";
import {upperCase} from "lodash";
import {axiosInstance} from "./axiosinstance/axiosInstance";
import {getReplaySession} from "/src/service/manager.js";
import initializeSocket from "./socket";
import {Route, Routes, useNavigate} from "react-router-dom";

import {
    setConsentData,
    setHeartbeat,
    setPermissions,
    setPermissionsInterfaceBlockId,
    setQueueData,
    setReplaySession,
    setSocket,
    setTerminateEvent
} from "/src/slices/Socket";

import AgentsUnavailableScreen from "/src/pages/AgentsUnavailableScreen.jsx";



const UnassistedRouter = (props) => {
    const {queryStrings} = props;
    return (
        <Routes>
            <Route
                path={'/'}
                exact
                element={<PreCheckPermission queryStrings={queryStrings}/>}
            />
            <Route
                path={'/error'}
                exact
                element={<AccessDeniedError/>}
            />
            <Route
                path={"/meeting"}
                exact
                element={<MeetingContainer queryStrings={queryStrings}/>}
            />
        </Routes>
    )
}

const AssistedRouter = (props) => {
    const {queryStrings} = props;
    return (
        <Routes>
            <Route
                path={'/'}
                exact
                element={<VideoKYCFlow/>}
            />
            {/* <Route path={"/cameraaccess"} element={<CameraAccess/>} /> */}
            {/* Other routes */}
            <Route
                path={'/permissions'}
                exact
                element={<PreCheckPermission
                    queryStrings={queryStrings}
                />}
            />
            <Route
                path={'/joining'}
                exact
                element={<WaitScreen/>}
            />
            <Route
                path={'/meeting'}
                exact
                element={<MeetingContainer/>}
            />
            <Route
                path={'/waiting'}
                exact
                element={<AgentsUnavailableScreen/>}
            />
            
            <Route
                path={'/joining/schedule'}
                exact
                element={<WaitScreen/>}
            />

             
        <Route
            path={'/error'}
            exact
            element={<AccessDeniedError/>}
        />

        </Routes>)
}

export default function App(props) {
    const {queryStrings} = props;
    const {socket, replaySession} = useSelector(state => state.SocketHandle)
    const queryParams = new URLSearchParams(location.search);

    const allQueryParams = Object.fromEntries(new URLSearchParams(location.search).entries())
    const modeValue = queryParams.get('mode');
    const meetingIdValue = queryParams.get('meeting_id');
    const [replaySessionData, setReplaySessionData] = useState(null);
    const nameValue = queryParams.get('name');
    const tokenValue = queryParams.get('token');
    const emailValue = queryParams.get('email');
    const webhookURL = queryParams.get('webhook');
    const signature = queryParams.get('signature');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const routeType = localStorage.getItem('type')

    const ComponentRoute = useCallback(() => routeType !== 'unassisted' || queryStrings?.type !== "unassisted" ?
            <AssistedRouter queryStrings={queryStrings}/> : <UnassistedRouter queryStrings={queryStrings}/>
        , []);

    useEffect(() => {

        dispatch(setMode(upperCase(modeValue)));
        dispatch(setAgentMeetingId(meetingIdValue));
        dispatch(setToken(tokenValue));
        dispatch(setWebhook(webhookURL));
        dispatch(setAgentName(nameValue));
        dispatch(setQueryParams(allQueryParams));

        if (queryStrings?.type == 'unassisted') {
            console.log("QueryStrings", queryStrings);
            dispatch(setQueryStrings(queryStrings));
            dispatch(setWebhook(queryStrings.webhook));
            dispatch(setAgentMeetingId(queryStrings.meeting_id));
        }

        // console.log('hello')
        async function getToken() {
            let signatureToken = '';
            if (localStorage.getItem('signature') !== "undefined") {
                signatureToken = localStorage.getItem('signature')
            } else {
                signatureToken = signature;
            }

            if (!socket && signatureToken) {
                try {
                    const response = await axiosInstance.post(`api/v1/user/initialize/verify/${signatureToken}`);
                    const token = await response.data?.authorization?.access_token;

                    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                    getReplaySession().then(replaySession => {
                        const messages = replaySession?.data?.messages;
                        const interactions = replaySession?.data?.interactions;
                        console.log("Is Consent", interactions, replaySession);
                        dispatch(setReplaySession(replaySession?.data));
                        replaySession?.data?.messages?.map((data) => {
                            if (data?.data?.interface_block_type === "on_interface_consent_input_block" && data?.data?.message?.message_type == 'HINT') {
                                dispatch(setConsentData(data?.data));
                            }
                        });
                    }).catch(error => {
                        console.log("error", error.response);

                    })
                    let newSocket = initializeSocket(token);
                    dispatch(setSocket(newSocket));
                } catch (error) {
                    navigate('/error');
                }
            }
        }

        if (localStorage.getItem('signature') || signature) {
            getToken()
        }
    }, []);

    const handleEvent = (eventName, ...args) => {
        if (eventName === "INTERFACE_OUTGOING_MESSAGE") {

            if (args[0]?.data?.message?.message_type == 'HINT') {
                dispatch(setSocketEvents(args));
                if(args[0]?.data?.message?.message_type=='TERMINATE'){
                    dispatch(setTerminateEvent(args[0]?.data));
                }
                if (args[0]?.data?.interface_block_type === "on_interface_consent_input_block") {
                    dispatch(setConsentData(args[0]?.data));
                } else if (args[0]?.data?.interface_block_type === "on_interface_heartbeat" && args[0]?.data?.interface_block_id === 'wait_for_userjoin' && args[0]?.data?.message?.message_type === 'HINT') {
                    socket.emit("interface_interaction", {
                        "interaction_type": args[0]?.data?.message?.interaction_type,
                        "interface_block_id": args[0]?.data?.interface_block_id
                    })
                } else if (args[0]?.data?.interface_block_type === "on_interface_heartbeat" && args[0]?.data?.interface_block_id === 'wait_for_userjoin_final' && args[0]?.data?.message?.message_type === 'HINT') {
                    console.log("Args in heartbeat", args[0]?.data?.interface_block_id);
                    dispatch(setHeartbeat(args[0]?.data?.interface_block_id))
                } else if (args[0]?.data?.interface_block_type === "send_web_notification_message_block" && args[0]?.data?.message?.message_type === 'ELEMENT') {
                    dispatch(setQueueData(args[0]?.data));
                } else if (args[0]?.data?.interface_block_type === "on_interface_prompt_input_block" && args[0]?.data?.message?.message_type === 'HINT') {
                    dispatch(setAgentMeetingId(args[0]?.data?.message?.parameters?.meeting_room_id));
                    dispatch(setToken(args[0]?.data?.message?.parameters?.authorization_token));
                    dispatch(setCustomerScript(args[0]?.data?.message?.parameters?.customer_script))
                    socket.emit("interface_interaction", {
                        "interaction_type": args[0]?.data?.message?.interaction_type,
                        "interface_block_id": args[0]?.data?.interface_block_id
                    })
                    if (queryStrings?.type !== 'unassisted') {
                        navigate('/meeting');
                    }
                    else{
                        dispatch(setUnassistedParameters(args[0]?.data?.message?.parameters));
                    }
                } else if (args[0]?.data?.interface_block_type === "send_web_terminated_message_block" && args[0]?.data?.message?.element_type === "TERMINATED_MESSAGE") {
                    dispatch(setAgentMeetingId(null));
                    dispatch(setToken(null));
                } else if (args[0]?.data?.interface_block_type === "on_interface_seek_permissions_block" && args[0]?.data?.message?.interaction_type === "SEEK_PERMISSIONS") {
                    dispatch(setPermissionsInterfaceBlockId(args[0]?.data?.interface_block_id));
                    dispatch(setPermissions(args[0]?.data?.message?.permissions));
                } else {
                    return;
                }
            }

        }
    }

    useEffect(() => {
        if (replaySession && socket) {
            setReplaySessionData(replaySession);
            const messages = replaySession?.messages?.filter(item => item?.data?.message?.message_type == 'HINT');
            const lastMessage = messages?.[messages?.length - 1] || null;
            const interactions = replaySession?.interactions;
            if(queryStrings?.type=='unassisted' && (replaySession?.messages?.length || replaySession?.interactions?.length)){
                const meetingBlockData =  messages?.find(item=> item?.data?.interface_block_id =='call_customer');
                console.log("Last Message in unassisted", lastMessage, meetingBlockData);
                const isMeetingBlockCompleted = interactions?.find(item => item?.data?.interface_block_id === "call_customer")
                if(isMeetingBlockCompleted){
                    dispatch(setAgentMeetingId(meetingBlockData?.data?.message?.parameters?.meeting_room_id));
                    dispatch(setToken(meetingBlockData?.data?.message?.parameters?.authorization_token));
                    dispatch(setCustomerScript(meetingBlockData?.data?.message?.parameters?.customer_script));
                    dispatch(setUnassistedParameters(meetingBlockData?.data?.message?.parameters));
                    navigate('/meeting');
                    return;
                }

                if(lastMessage?.data?.message?.interaction_type =='TERMINATE'){
                    dispatch(setTerminateEvent(lastMessage?.data));
                }
                if(meetingBlockData){
                    dispatch(setAgentMeetingId(meetingBlockData?.data?.message?.parameters?.meeting_room_id));
                    dispatch(setToken(meetingBlockData?.data?.message?.parameters?.authorization_token));
                    dispatch(setCustomerScript(meetingBlockData?.data?.message?.parameters?.customer_script));
                    dispatch(setUnassistedParameters(meetingBlockData?.data?.message?.parameters));
                    let payload = {
                        "interaction_type": meetingBlockData?.data?.message?.interaction_type,
                        "interface_block_id": meetingBlockData?.data?.interface_block_id,
                    }
                    if(lastMessage?.data?.message?.message_type=='HINT' && lastMessage?.data?.message?.interaction_type=='PROMPT_INPUT'){
                        Object.assign(payload, {action:'ACCEPTED'});
                    }
                    socket.emit('interface_interaction', payload);
                    navigate('/meeting');
                }

                return;
            }
            //Hint in message blocks
            if (messages?.length) {
                const isBlockTypeNotInInteractions = interactions?.some(item => item?.data?.interface_block_id !== lastMessage?.data?.interface_block_id)
                let payload = {
                    "interaction_type": lastMessage?.data?.message?.interaction_type,
                    "interface_block_id": lastMessage?.data?.interface_block_id,
                }

                //Check is consent
                const isConsentPending = messages?.some(item => item?.data?.message?.interaction_type == 'CONSENT_INPUT') && interactions?.some(item => item?.data?.interaction_type !== 'CONSENT_INPUT');
                const isConsentFullfilled = interactions?.some(item => item?.interface_block_id == 'on_interface_consent_input_block');

                //Is Userfinal block
                //event block id: wait_for_userfinal_join
                //pending case
                const isUserFinalPending = messages?.some(item => item.data?.interaction_type == 'HEARTBEAT' && item.data?.interface_block_id == 'wait_for_userjoin_final') && interactions?.some(item => item?.data?.interface_block_id !== 'wait_for_userfinal_join');

                //complete case
                const isUserFinalBlockSuccess = interactions?.find(item => item?.data?.interface_block_id == 'wait_for_userfinal_join');

                //Is Permission block
                //event block id: seek_permissions
                const isPermissionBlockPending = messages?.some(item => item?.data?.interface_block_id == 'seek_permissions');
                const isPermissionBlockFullfilled = interactions?.some(item => item?.data?.interface_block_id == 'seek_permissions');

                //Meeting block in messages
                const isMeetingPending = messages?.find(item => item?.data?.interface_block_type === "on_interface_prompt_input_block" && item?.data?.message?.message_type === 'HINT' && item?.data?.message?.action === 'NAVIGATE_TO_MEETING');

                //Meeting block in interaction
                const isMeetingBlockCompleted = interactions?.find(item => item?.interface_block_type === "on_interface_prompt_input_block" && item?.data?.message?.action === 'NAVIGATE_TO_MEETING')

                //Check user flow steps
                if (isConsentFullfilled) {
                    if (isPermissionBlockFullfilled) {
                        if (isUserFinalBlockSuccess) {
                            if (isMeetingBlockCompleted) {
                                dispatch(setAgentMeetingId(isMeetingBlockCompleted?.data?.message?.parameters?.meeting_room_id));
                                dispatch(setToken(isMeetingBlockCompleted?.data?.message?.parameters?.authorization_token));
                                dispatch(setCustomerScript(isMeetingBlockCompleted?.data?.message?.parameters?.customer_script));
                                navigate('/meeting');
                                return;
                            }
                            dispatch(setAgentMeetingId(lastMessage?.data?.message?.parameters?.meeting_room_id));
                            dispatch(setToken(lastMessage?.data?.message?.parameters?.authorization_token));
                            dispatch(setCustomerScript(lastMessage?.data?.message?.parameters?.customer_script));
                            socket.emit('interface_interaction', {...payload, "action": "ACCEPTED"}, () => {
                                navigate('/meeting');
                            });
                            return;
                        }
                        socket.emit('interface_interaction', payload, () => {
                            navigate('/joining');
                        });
                        return;
                    }
                    socket.emit('interface_interaction', payload, () => {
                        navigate('/permission');
                    });
                    return;
                }
            }


        }

    }, [replaySession, socket])

// socket connection
    useEffect(() => {
        if ((localStorage.getItem('signature') || signature) && socket) {
            socket.on("connect", () => {
                console.log("Connected", socket.id);
            });

            // Handle any event
            socket.onAny(handleEvent);

            socket.on("disconnect", () => {
                console.log("Disconnect", socket.id); // Log disconnection
            });
            // Optional: Log errors to help debug
            socket.on("connect_error", (error) => {
                console.error("Connection Error:", error);
            });
        }
    }, [socket]);

    return (
        <div className={'min-h-screen'}>
            <ComponentRoute/>
        </div>

    )
}
