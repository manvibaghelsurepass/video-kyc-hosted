import { Button } from "/src/components/ui/button"
import { Checkbox } from "/src/components/ui/checkbox.jsx";
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAgentMeetingId, setAgentName, setMode, setQueryParams, setToken, setWebhook } from "/src/slices/appSlice.js";
import { lowerCase, startCase, upperCase } from 'lodash'
import { Languages } from "lucide-react";
import { useTranslation } from 'react-i18next'
import i18next from "i18next";
import { ScrollArea } from "/src/components/ui/scroll-area";
import {
    FaOm, FaMosque, FaLeaf, FaWheatAwn
} from "react-icons/fa6";
import { FaCoffee } from "react-icons/fa";
import {
    GiTigerHead, GiElephant, GiLotusFlower, GiCoconuts, GiBanana, GiMountainRoad
} from "react-icons/gi";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "/src/components/ui/dialog";
import { RiEnglishInput } from "react-icons/ri";
// import flowImage from '/src/assets/VKYC2[1].jpg'
// import flowImage from '/src/assets/VKYC2.jpg'; 
import darkFlowImage from '/src/assets/VKYC-Dark-Mode.jpg';
import kycFlowImage from '/src/assets/kyc-flow-image.jpg';
import flowImage from '/src/assets/Instructions.svg'
import surepassLogo from '../../src/assets/surepassLogo.png'
import darkSPLogo from '/src/assets/White-Surepass-Logo.png'
import initializeSocket from "../socket";
import {
    setConsentData, setHeartbeat,
    setPermissions,
    setPermissionsInterfaceBlockId,
    setQueueData,
    setSocket
} from "../slices/Socket";
import { axiosInstance } from "../axiosinstance/axiosInstance";
import { DialogClose, DialogTrigger } from "@radix-ui/react-dialog";
import { getReplaySession } from "/src/service//manager.js";
import VKYCFlowChart from "/src/assets/svg/VKYCFlowChart.jsx";
export default function VideoKYCFlow() {
    const { socket, replaySession, transcriptData } = useSelector(state => state.SocketHandle)
    const location = useLocation();
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const queryParams = new URLSearchParams(location.search);
    const modeValue = queryParams.get('mode');
    const meetingIdValue = queryParams.get('meeting_id');
    const nameValue = queryParams.get('name');
    const tokenValue = queryParams.get('token');
    const emailValue = queryParams.get('email');
    const webhookURL = queryParams.get('webhook');
    const signature = queryParams.get('signature')

    //agent-side token
    const superflow_token = queryParams.get('superflow_token');
    const allQueryParams = Object.fromEntries(new URLSearchParams(location.search).entries())
    const [checked, setChecked] = useState(true)
    const navigator = useNavigate();
    const { t } = useTranslation();
    const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
    const { queryParams: params, theme } = useSelector(state => state.appSlice);
    const { consentData } = useSelector(state => state.SocketHandle);
    const [terms_and_conditions, setTerms_and_conditions] = useState(false);
    const [replaySessionData, setReplaySessionData] = useState([]);
    const [showInstructions, setShowInstructions] = useState(false);
    const { title, intro, listContent, noteContent } = parseTerms(consentData?.message?.terms_and_conditions);

    // const languages = [{ code: 'en', name: 'English', icon: RiEnglishInput }, {
    //     code: 'hin', name: 'Hindi', icon: FaOm
    // }, { code: 'bn', name: 'Bengali', icon: GiTigerHead }, { code: 'te', name: 'Telugu', icon: GiElephant }, {
    //     code: 'mr', name: 'Marathi', icon: FaOm
    // }, { code: 'ta', name: 'Tamil', icon: GiLotusFlower }, { code: 'ur', name: 'Urdu', icon: FaMosque }, {
    //     code: 'gu', name: 'Gujarati', icon: FaLeaf
    // }, { code: 'ml', name: 'Malayalam', icon: GiCoconuts }, { code: 'kn', name: 'Kannada', icon: GiBanana }, {
    //     code: 'pa', name: 'Punjabi', icon: FaWheatAwn
    // }, { code: 'as', name: 'Assamese', icon: GiMountainRoad }, { code: 'or', name: 'Odia', icon: FaCoffee },];

    // const handleLanguageChange = (langCode) => {
    //     i18next.changeLanguage(langCode);
    //     setLanguageDialogOpen(false);
    // };

    useEffect(() => {
        dispatch(setQueryParams(allQueryParams))
        if (modeValue?.toUpperCase() == 'USER') {
            localStorage.setItem('user_name', nameValue);
            localStorage.setItem('user_email', emailValue);
        }
        if (upperCase(modeValue) === 'AGENT') {
            i18next.changeLanguage('en')
            navigator('/meeting')
        }

    }, [modeValue, meetingIdValue, nameValue, emailValue]);

    useEffect(() => {
        i18next.changeLanguage('en')
    }, [])
    useEffect(() => {
        console.log('Theme:', theme);
        console.log("ima")
        console.log('Image Source:', theme === 'dark' ? darkFlowImage : flowImage);
    }, [theme]);  // new add for image 

    const isConsent = useMemo(() => {
        console.log('Replay Session', replaySession);
        return replaySession?.interactions?.some(item => item?.data?.interaction_type == 'CONSENT_INPUT');
    }, [replaySession]); 

    console.log("Consnent Data", consentData, socket);

    const toggleInstructions = () => {
        setShowInstructions(!showInstructions);
    };
    return (
        <>
            <div className="relative  z-50 flex flex-col items-center justify-center min-h-[99dvh] bg-gradient-to-t from-primary-100 to-secondary-200 overflow-hidden border-0">
                <div className=" fixed flex  border-0 flex-col  border-border max-w-lg justify-between md:border min-h-[86dvh] bg-background py-6 px-4 sm:px-5 md:px-8 rounded-3xl  overflow-hidden ">
                    <div className="grid grid-cols-1 gap-10">
                        <div className="flex justify-center">
                            <div className="flex flex-col items-center justify-center w-full">
                                <div className="flex justify-end w-full mb-3">
                                    <div className="flex items-center justify-between w-full">

                                            {/*// // src={theme === 'dark' ? darkSPLogo : surepassLogo}*/}
                                            {/*// alt="Logo"*/}
                                            {/*// className="h-5"*/}
                                        <img
                                            src="https://surepass.io/wp-content/uploads/2019/09/2-layers@2x.png"
                                            className="h-6 object-contain rounded-lg"
                                            alt="Flow Diagram"

                                            />

                                    </div>
                                </div>

                                <div className="w-full mt-5 ">
                                    <h1 className="text-lg opacity-80 font-500 text-center font-poppins font-medium text-card-foreground font-poppins sm:text-16 md:text-xl">
                                        Hi {startCase(lowerCase(params.name))}! Welcome to Surepass <br/> Video KYC
                                    </h1>

                                    <div className="flex justify-center mt-6">
                                        <img
                                            src={flowImage}
                                            className="h-[50vh] object-contain rounded-lg"
                                            alt="Flow Diagram"
                                        />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-6 overflow-hidden text-start">
                        <Button
                            disabled={!checked}
                            onClick={() => {
                                if (checked && !isConsent && socket) {
                                    socket.emit('interface_interaction', {
                                        interaction_type: consentData?.message?.interaction_type,
                                        action: 'ACCEPTED',
                                        interface_block_id: consentData?.interface_block_id,
                                    });
                                    navigator('/permissions');
                                } else {
                                    navigator('/permissions');
                                }
                            }}
                            variant="outline"
                        //     className={`w-full h-13  text-base py-3 mt-8 transition duration-300 rounded-0.5 flex items-center justify-center font-poppins font-medium ${!checked ? 'bg-gray-400 text-gray-300 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary   hover:text-primary-foreground focus:outline-none active:bg-primary  '}`}
                        // >
                            className={`w-full h-13  text-base py-3 mt-6 transition duration-300  flex items-center justify-center font-poppins font-medium ${!checked ? 'bg-gray-400 text-gray-300 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary   hover:text-primary-foreground focus:outline-none active:bg-primary-600  '}`}
                        >
                            {t('instructionPageProceedBtn')}
                        </Button>

                        <div className="flex items-start space-x-2 bottom-2 ">
                            <label className="text-sm text-card-foreground">
                                {consentData?.message?.label}{' '}
                                <div className="px-3 space-y-5 text-center sm:px-5 md:px-8">
                                    <div className="px-4 text-center sm:px-3 md:px-8">
                                        <div
                                            className="mt-1 text-gray-900 font-poppins text-sm text-black opacity-70 sm:text-md md:text-md">

                                            {/*<div className="mt-1 text-400 font-poppin font-15 text-black opacity-70 sm:text-md md:text-md">*/}
                                            <p>
                                                By clicking Proceed, you agree to the Video
                                                <span className="inline-block ml-1"></span>
                                            </p>

                                            {showInstructions && (
                                                <>
                                                    {/* Background Overlay */}
                                                    <div
                                                        className="fixed inset-0 mb-8 bg-black bg-opacity-50"
                                                        onClick={toggleInstructions}
                                                    ></div>

                                                    {/* Instructions Modal */}
                                                    <div
                                                        className="relative p-4 w-[95%] rounded-md p-6 bg-background overflow-hidden bg-gray-100 border border-gray-300 rounded-md shadow-md"
                                                        style={{
                                                            position: "fixed",
                                                            top: "30%",
                                                            left: "50%",
                                                            transform: "translateX(-50%)",
                                                            maxHeight: "200px",
                                                            width: "90%",
                                                            maxWidth: "400px",
                                                            zIndex: 1001, // Higher than overlay
                                                        }}
                                                    >
                                                        {/* Close Button */}
                                                        <button
                                                            onClick={toggleInstructions}
                                                            className="absolute text-gray-600 top-2 right-2 hover:text-gray-800"
                                                        >
                                                            ✕
                                                        </button>

                                                        <h3 className="text-lg font-semibold ">
                                                            Instructions for Video KYC Verification
                                                        </h3>
                                                        <p className=" h-20 w-20 space-y-2 list-disc">
                                                            {noteContent.map((item, index) => (
                                                                <li key={index}>{item}</li>
                                                            ))}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex justify-center space-x-2">
                                            <a
                                                href="#"
                                                className="text-md font-medium cursor-pointer text-black-600 hover:text-blue-700 hover:underline"
                                                onClick={(e) => {
                                                    e.preventDefault(); // Prevent default anchor behavior
                                                    toggleInstructions();
                                                }}
                                            >
                                                {t('read more')}
                                            </a>
                                            <a
                                                onClick={() => setTerms_and_conditions(true)}
                                                href="#"
                                                className="text-sm font-bold text-primary underline cursor-pointer hover:text-blue-900 hover:underline"
                                            >
                                                {t('T&Cs apply')}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                            </label>
                        </div>

                        <Dialog open={terms_and_conditions} onOpenChange={setTerms_and_conditions}>
                            <DialogContent className="w-[95%] rounded-md p-6 bg-background">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Terms and Conditions</DialogTitle>
                                    <DialogDescription className="text-base font-semibold">{title}</DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="mt-4 max-h-[60vh] pr-4">
                                    <div className="space-y-4 text-sm">
                                        <p>{intro}</p>
                                        <ol className="pl-5 space-y-2 list-decimal">
                                            {listContent.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ol>
                                        <p className="font-semibold">Please note:</p>
                                        <ul className="pl-5 space-y-2 list-disc">
                                            {noteContent.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </ScrollArea>
                                <DialogFooter className="mt-4">
                                    <DialogClose>
                                        <Button onClick={() => setTerms_and_conditions(false)} className="w-full">
                                            I Agree
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>


        </>)
}

const parseTerms = (terms) => {
    const parts = terms?.split(": ") || []
    const title = parts[0] || "Consent for Video KYC Verification"
    const content = parts.slice(1).join(": ")

    const [introAndList = "", notes = ""] = content.split("Please note:")
    const [intro = "", listItems = ""] = introAndList.split("By clicking 'I Agree,' you consent to the following:")

    const listContent = listItems
        .split(/\d+\./)
        .filter(item => item.trim() !== "")
        .map(item => item.trim())

    const noteContent = notes
        .split(".")
        .filter(item => item.trim() !== "")
        .map(item => item.trim())

    return { title, intro: intro.trim(), listContent, noteContent }
}
