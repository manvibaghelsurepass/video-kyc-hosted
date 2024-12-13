
import React, {useEffect, useState} from "react";
import {
    MeetingProvider,
    MeetingConsumer,
    useMeeting,
    useParticipant,
} from "@videosdk.live/react-sdk";

import MeetingView from "/src/pages/MeetingView.jsx";
import UnassistedMeetingView from "/src/pages/unassisitedJoureny/UnassistedMeetingView.jsx";
import {useDispatch, useSelector} from "react-redux";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "/src/components/ui/card.jsx";
import {Label} from "/src/components/ui/label.jsx";
import {Textarea} from "/src/components/ui/textarea.jsx";
import {Button} from "/src/components/ui/button.jsx";
import SwitchCameraListner from "/src/pages/SwitchCameraListner.jsx";
import { Star, Send, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import {useLocation} from "react-router-dom";
import {setAgentMeetingId, setToken} from "/src/slices/appSlice.js";
import Feedback from "/src/assets/svg/Feedback.jsx";

function ConnectMeetingView(props) {
    const [joined, setJoined] = useState(null);
    
    const {participants} = useMeeting({
        onMeetingJoined:()=>{
            setJoined('JOINED')
        },
    });

    return (
        <div className="relative z-50 ">
            {/*<h3>Meeting Id: {props.meetingId}</h3>*/}
            { joined == "JOINED" ?  (
                <>
                    {localStorage.getItem('type')=='unassisted' ?<UnassistedMeetingView/> : <MeetingView setJoined={setJoined}  />}
                </>

            ) :
                    <div className={'h-screen flex place-content-center items-center'}>
                        <div className={'grid gap-4 justify-center items-center'}>
                            <div className={'mx-auto'} id="wifi-loader">
                                <svg className="circle-outer" viewBox="0 0 86 86">
                                    <circle className="back" cx="43" cy="43" r="40"></circle>
                                    <circle className="front" cx="43" cy="43" r="40"></circle>
                                    <circle className="new" cx="43" cy="43" r="40"></circle>
                                </svg>
                                <svg className="circle-middle" viewBox="0 0 60 60">
                                    <circle className="back" cx="30" cy="30" r="27"></circle>
                                    <circle className="front" cx="30" cy="30" r="27"></circle>
                                </svg>
                                <svg className="circle-inner" viewBox="0 0 34 34">
                                    <circle className="back" cx="17" cy="17" r="14"></circle>
                                    <circle className="front" cx="17" cy="17" r="14"></circle>
                                </svg>
                                <div className="text" data-text=""></div>
                            </div>
                            <p>
                                Your meeting is about to connect please wait.
                            </p>
                        </div>
                    </div>
            }
        </div>
    );
}

function App(props) {
    const [meetingId, setMeetingId] = useState(null);
    const [name, setName] = useState(null);
    const {agentName, mode, agentMeetingId, token, queryStrings} = useSelector((state) => state.appSlice);


    useEffect(() => {
        setMeetingId(agentMeetingId);
        setName(agentName);
    }, [agentName, mode, agentMeetingId, token]);

    return  meetingId && token ? (
        <MeetingProvider
            config={{
                meetingId,
                micEnabled: true,
                webcamEnabled: true,
                maxResolution: 'hd',
                name: name,
                defaultCamera: true,
                participantId: mode,
                multiStream: false,
                permissions: {
                    toggleRecording: true,
                    //...
                },
            }}
            joinWithoutUserInteraction={true}
            // reinitialiseMeetingOnConfigChange={true}
            token={token}
        >
            <MeetingConsumer>
                {() => (
                    <ConnectMeetingView meetingId={meetingId}/>
                )}
            </MeetingConsumer>
        </MeetingProvider>
    ) : (
        <FinalReview />
    )

    function StarIcon(props) {
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
                <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        )
    }
}

export default App;



export function FinalReview() {
    const [rating, setRating] = useState(0)
    const [feedback, setFeedback] = useState("")
    const [submitted, setSubmitted] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState(null);
    
    

    const handleSubmit = (e) => {
        e.preventDefault()
        // console.log({ rating, feedback,},"kiiiiiiiiii")
        setSubmitted(true)
    }

    const content = submitted ? (
        // <div className="fixed inset-0 z-80 flex items-center justify-center backdrop-blur-2xl bg-gray-400 bg-opacity-90">
            <div className="min-h-screen  flex items-center justify-center p-1">
            <motion.div
                initial={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 1}}
                transition={{duration: 0.5}}
                className="w-full max-w-sm"
            >
                <Card className="p-4 text-center space-y-9 relative"> {/* Adjusted padding */}
                    <motion.div
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        transition={{
                            delay: 0.2,
                            type: 'spring',
                            stiffness: 200,
                            damping: 10,
                        }}
                        className="w-17 h-17 mx-auto bg-red-900 "
                    >
                        <span
                            className="text-6xl absolute top-[-40px] left-1/2 transform -translate-x-1/2"
                            role="img"
                            aria-label="Star eyes emoji"
                        >
                    🤩
                </span>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.3}}
                        className="space-y-3"
                    >
                        <h2 className="text-xl  font-poppin font-bold tracking-tight text-primary">
                            Thank You for Your <br/> Feedback!
                        </h2>
                        <p className="text-md bottom-4 font-poppin text-muted-foreground">
                            We appreciate your time and value your input.
                        </p>
                    </motion.div>
                </Card>
            </motion.div>
        </div>


    ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white rounded-lg  bg-opacity-90">
                <div className="w-full max-w-sm p-6  border-2 border-blue-100 rounded-lg ">
                    <div className="flex items-center mb-6 ">
                        {/* <div className="mr-2 text-blue-700 w-7 h-7">💬</div> */}
                        <Feedback/>

                        <h1 className="text-lg font-semibold ml-2">Feedback</h1>

                    </div>
                    <hr className={"h-2 mb-2 border-blue-100"}/>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="text-center">
                            <h3 className="mb-1 text-lg  font-poppin font-medium">Your Video KYC Experience?</h3>
                            <p className="mb-6 text-gray-900 text-md opacity-60">
                                Your feedback helps us improve and serve you better!
                            </p>
                            <div className="flex justify-center mt-4 space-x-5 ">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-400 ease-in-out transform ${
                                            rating === value
                                                ? 'bg-blue-100 border-yellow-700 scale-150' // Scale up when selected (zoom effect)
                                                : 'bg-gray-100 border-gray-300 scale-100' // Default size when not selected
                                        }`}
                                        onClick={() => setRating(value)}
                                    >
                                        {value === 1 ? '☹️' : value === 2 ? '😑' : value === 3 ? '😍' : value === 4 ? '😊' : '🥰'}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-4 font-medium text-md">
                                {rating === 1
                                    ? 'Very Poor'
                                    : rating === 2
                                        ? 'Poor'
                                        : rating === 3
                                            ? 'Excellent'
                                            : rating === 4
                                                ? 'Good'
                                                : 'Excellent'}
                            </p>


                        </div>

                        <div>
                            <label htmlFor="feedback" className="block mb-5 text-sm font-medium text-gray-900">

                            </label>
                            <textarea
                                id="feedback"
                                placeholder=" Comment (optional)"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full h-32 p-3 text-sm border-2 border-blue-100 rounded-sm  bg-blue-50 focus:ring-blue-100 focus:outline-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        >
                            Submit Feedback
                        </button>
                    </form>

                    <p className="mt-5 text-sm text-center text-gray-900">
                        Your input makes a big difference
                    </p>
                </div>
            </div>


            );

            return content;
            }


