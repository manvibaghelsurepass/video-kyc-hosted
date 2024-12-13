import { useState, useEffect } from 'react'
import { Button } from "/src/components/ui/button"
import { Card, CardContent, CardFooter } from "/src/components/ui/card"
import { Textarea } from "/src/components/ui/textarea"
import { Checkbox } from "/src/components/ui/checkbox"
import { Label } from "/src/components/ui/label"
import { AlertCircle, CheckCircle, FileText, User, XCircle } from 'lucide-react'
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { setDecision, setIsRejecting } from "/src/slices/socket.js";
import { useToast } from "/src/components/ui/use-toast.js";
import { startCase } from "lodash";
import { ToastAction } from "/src/components/ui/toast.jsx";
import { cn } from "/src/lib/utils.js";

import { setAgentMeetingId, setIsUserVerify, setToken } from "/src/slices/appSlice.js";
import { submitQuestionariesAPI } from "/src/service/manager.js";


const rejectionReasons = [
    { id: 'document_mismatch', label: 'Document Mismatch' },
    { id: 'poor_video_quality', label: 'Poor Video Quality' },
    { id: 'incomplete_information', label: 'Incomplete Information' },
    { id: 'suspicious_behavior', label: 'Suspicious Behavior' },
    { id: 'other', label: 'Other' },
]

export default function FinalReview() {
    const {
        socket,
        userDetails,
        faceImage,
        panImage,
        isRejecting,
        decision,
        userGeoLocation
    } = useSelector(state => state.SocketHandle);
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [questionnairesStatus, setQuestionnairesStatus] = useState(false);
    const { stopRecording } = useMeeting();
    const [feedback, setFeedback] = useState('');
    const { queryParams, isUserVerify, questionResponse, questionarries, isDocumentVerify, isFaceMatch } = useSelector(state => state.appSlice);
    const { first_name, last_name, pan_number, dob, permanent_address } = userDetails;
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { publish: endMeeting } = usePubSub(`ENDMEETING`);
    const [kycSteps, setKycSteps] = useState([
        { id: 'document_verification', label: 'Document Verification', status: 'completed' },
        { id: 'facial_recognition', label: 'Facial Recognition', status: 'completed' },
        { id: 'background_check', label: 'Background Check', status: 'pending' },
    ])

    const submitQuestinnarie = () => {
        const responseArray = Object.entries(questionResponse).map(([key, value], index) => {
            return {
                "question": key,
                "match_status": value ? 'MATCHED' : 'MISMATCHED',
                "answer": questionarries[key],
            }
        });

        const responseObject = {
            submit_questionnaire: responseArray
        }

        submitQuestionariesAPI(responseObject).then(res => {
            dispatch(setIsUserVerify(true));
            setQuestionnairesStatus(true)
        }).catch(err => {
            setQuestionnairesStatus(false)
            toast({
                className: cn(
                    "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4"
                ),
                variant: "destructive",
                title: (
                    <h1>
                        {err.response?.data?.status_code} {err?.response?.data?.message}
                    </h1>
                ),
                description:
                    startCase(err?.response?.data?.data?.remarks) ||
                    err?.response?.data?.message ||
                    "There was a problem with your request.",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        })
    }

    const handleAccept = async () => {
        stopRecording();
        dispatch(setIsRejecting(false))
        console.log(userGeoLocation, 'userLocation')
        try {
            submitQuestinnarie()
            const payload = {
                customer_email: userDetails?.email,
                name: `${userDetails?.first_name} ${userDetails?.last_name}`,
                agent_action: 'APPROVED',
                pan_base64: panImage,
                user_photo_base64: faceImage,
                reason: feedback,
                meeting_id: queryParams?.meeting_id,
                usergeolocation: userGeoLocation,
            };
            const result = await axios.post(`${import.meta.env.VITE_SUPERFLOW_BASE_URL}/api/v1/vkyc/agent/agent-action`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${queryParams.superflow_token}`
                    }
                }
            );
            if (result) {
                dispatch(setDecision('ACCEPTED'));
                endMeeting('ENDMEETING')
                dispatch(setAgentMeetingId(null))
                dispatch(setToken(null));
                socket.emit('interface_interaction', {
                    "interaction_type": "TERMINATE",
                    "status": "SUCCESSFUL",
                    "description": feedback,
                })
            }
            toast({
                className: cn(
                    "top-0 right-0 flex fixed md:max-w-[420px] md:top-12 md:right-4 bg-white border-l-4 border-l-green-500 rounded-md shadow-lg"
                ),
                description: (
                    <div className="flex items-start space-x-3">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">Application Accepted</p>
                            <p className="text-gray-500 dark:text-gray-400">KYC details submitted successfully.</p>
                        </div>
                    </div>
                )
            })
        } catch (err) {
            // dispatch(setDecision('ACCEPTED'));
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

    const handleReject = async () => {
        dispatch(setIsRejecting(true))
    }

    const handleSubmit = async () => {
        stopRecording();
        if (selectedReasons.length > 0) {
            dispatch(setDecision('REJECTED'));

            // Here you would typically call an API to update the user's KYC status
            try {
                const payload = {
                    customer_email: userDetails?.email,
                    name: `${userDetails?.first_name} ${userDetails?.last_name}`,
                    agent_action: 'REJECTED',
                    pan_base64: panImage,
                    user_photo_base64: faceImage,
                    reason: feedback,
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
                    dispatch(setIsRejecting(true));
                    endMeeting('ENDMEETING')
                    dispatch(setAgentMeetingId(null))
                    dispatch(setToken(null));
                    socket.emit('interface_interaction', {
                        "interaction_type": "TERMINATE",
                        "status": "FAILED",
                        "description": feedback,
                    })
                }
                dispatch(setIsRejecting(false))
                toast({
                    className: cn(
                        "top-0 right-0 flex fixed md:max-w-[420px] md:top-12 md:right-4 bg-white border-l-4 border-l-green-500 rounded-md shadow-lg"
                    ),
                    description: (
                        <div className="flex items-start space-x-3">
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">Application Rejected</p>
                                <p className="text-gray-500 dark:text-gray-400">KYC details submitted successfully.</p>
                            </div>
                        </div>
                    ),
                })
            } catch (err) {
                dispatch(setIsRejecting(false));
                toast({
                    className: cn(
                        "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4"
                    ),
                    variant: "destructive",
                    title: (
                        <h1>
                            {err.response?.data?.status_code} {err.response?.data?.message}
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
    }

    const toggleReason = (reasonId) => {
        setSelectedReasons(prev =>
            prev.includes(reasonId)
                ? prev.filter(id => id !== reasonId)
                : [...prev, reasonId]
        )
    }

    useEffect(() => {
        const tempArray = [...kycSteps];
        tempArray.map(item => {
            if (item.id == 'document_verification') {
                item.status = isDocumentVerify;
            }
            else if (item.id == 'facial_recognition') {
                item.status = isFaceMatch;
            }
            else {
                item.status = isUserVerify;
            }
        });
        setKycSteps(tempArray);
    }, [isUserVerify, isDocumentVerify, isFaceMatch]);

    return (
        <Card className="w-full mx-auto border-none shadow-none bg-card">
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-card-foreground" />
                            <h3 className="text-lg font-semibold">User Information</h3>
                        </div>
                        <div className="space-y-2 pl-7">
                            <p className="text-sm"><span
                                className="font-medium">Name: </span>{`${first_name || ''} ${last_name || ''}`}</p>
                            <p className="text-sm"><span className="font-medium">PAN Number: </span>{pan_number || ''}</p>
                            <p className="text-sm"><span className="font-medium">Date of Birth: </span>{dob || ''}</p>
                            <p className="text-sm"><span className="font-medium">Address:</span>{permanent_address || ''}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-card-foreground" />
                            <h3 className="text-lg font-semibold">KYC Status</h3>
                        </div>
                        <div className="space-y-2 pl-7">
                            {kycSteps.map((step) => (
                                <div key={step.id} className="flex items-center justify-between">
                                    <span className="text-sm">{step.label}</span>
                                    <span className={`text-sm font-medium ${step.status ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {step.status ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}

                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {isRejecting && (
                    <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold">Rejection Reasons</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {rejectionReasons.map((reason) => (
                                <div key={reason.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={reason.id}
                                        checked={selectedReasons.includes(reason.id)}
                                        onCheckedChange={() => toggleReason(reason.id)}
                                    />
                                    <Label htmlFor={reason.id} className="text-sm">{reason.label}</Label>
                                </div>
                            ))}
                        </div>
                        <Textarea
                            placeholder="Additional comments..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end pt-6 space-x-2 border-t">
                {isRejecting ? (
                    <>
                        <Button variant="outline"
                            className="border bg-secondary text-secondary-foreground border-border dark:bg-background"
                            onClick={() => dispatch(setIsRejecting(false))}>Cancel</Button>
                        <Button variant="destructive" onClick={handleSubmit} disabled={selectedReasons.length === 0}>
                            Submit Rejection
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="destructive" onClick={handleReject} disabled={decision !== 'PENDING'}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Application
                        </Button>
                        <Button variant="default" className="bg-primary text-primary-foreground" onClick={handleAccept}
                            disabled={decision !== 'PENDING'}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept Application
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    )
}
