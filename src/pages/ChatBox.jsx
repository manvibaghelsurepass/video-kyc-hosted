import { Card, CardHeader, CardFooter } from "/src/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "/src/components/ui/avatar"
import { Button } from "/src/components/ui/button"
import { ScrollArea } from "/src/components/ui/scroll-area"
import { Textarea } from "/src/components/ui/textarea"
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { memo, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { startCase, lowerCase } from 'lodash'

import { Input } from "/src/components/ui/input.jsx";
import {Scroll, SendHorizonal} from "lucide-react";
import sound from "/src/assets/sound.mp3"
import { useTranslation } from "react-i18next"
import { useToast } from "../components/ui/use-toast"
import { cn } from "/src/lib/utils.js";
import Chatbox from "/src/assets/Meetingview/Chatbox.jsx";
import Arrowchat from "/src/assets/Meetingview/Arrowchat.jsx";
import Arrowchatupward from "/src/assets/Meetingview/Arrowchatupward.jsx";
import Scrollogo from "/src/components/svg/Meetingview/Scrollogo.jsx";

function ChatMessages() {
    const { mode } = useSelector((state) => state.appSlice);
    const mMeeting = useMeeting();
    const listRef = useRef();
    const { messages } = usePubSub("CHAT");
    const { t } = useTranslation();

    const scrollToBottom = (data) => {
        if (!data) {
            if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
            }
        } else {
            const { text } = data;
            if (json_verify(text)) {
                const { type } = JSON.parse(text);
                if (type === "CHAT") {
                    if (listRef.current) {
                        listRef.current.scrollTop = listRef.current.scrollHeight;
                    }
                }
            }
        }
    };
        useEffect(() => {
        scrollToBottom(messages);
    }, [messages]);
    function formatTime(isoDateString) {
        // Create a new Date object from the ISO string
        const date = new Date(isoDateString);
        // Get the hours and minutes
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        // Format the time in "HH:mm" format
        return `${hours}:${minutes}`;
    }
    return (
        <ScrollArea
            ref={listRef}
            className={`p-1 w-full bg-gray-100 h-[100%] flex items-center justify-center ${messages.length === 0 ? 'bg-cover bg-center' : ''}`}
            style={{ backgroundImage: messages.length === 0 ? 'none' : 'url("/path/to/your/image.jpg")' }} // if you want a background image
        >
            {messages.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full">
                    {/* Inline SVG when no messages */}
                  <Scrollogo/>
                </div>
            ) : (
                messages.map(({ senderId, senderName, message, timestamp }, index) => {
                    const localParticipantId = mMeeting?.localParticipant?.id;
                    const localSender = localParticipantId === senderId;
                    return localSender ? (
                        <div
                            key={index}
                            className={`flex items-start mb-3 gap-3 ${localSender ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="bg-blue-100 mr-17 text-black rounded-md rounded-tr-[1px] p-2 px-1 max-w-[70%] min-w-[25%] h-10 font-poppin flex items-center">
                                <div className="flex gap-2 justify-between font-base text-sm font-poppin text-black">
                                    {message}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={index}
                            className={`flex items-start mb-2 gap-3 ${localSender ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="flex items-start gap-1 p-2">
                                <div className="h-9 w-9 flex items-center justify-center rounded-full overflow-hidden bg-blue-100">
                                    {senderName[0].toUpperCase()}
                                </div>
                                <div className="rounded-bl-sm rounded-br-sm rounded-tr-[10px] p-2 bg-white text-gray-800 min-w-[25%] max-w-[70%] border-0 sm:w-auto w-auto break-words">
                                    {message}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </ScrollArea>
    )
}
function ChatBox() {
    const {localParticipant} = useMeeting();
    const {toast} = useToast()
    const {mode} = useSelector((state) => state.appSlice);
                const {t} = useTranslation();
                const [message, setMessage] = useState('');

                function onOldMessagesReceived(message) {
                console.log("Messages OLD:", message);
            }

                const topic = "CHAT";
                const {publish: send} = usePubSub(topic, {
                onMessageReceived: (data) => {
                const {senderId, senderName, message} = data;
                const isLocal = senderId === localParticipant?.id;
            if (!isLocal) {
                var audio = new Audio(sound);
                audio.play();
                toast({
                    className: cn(
                        "top-4 h-fit flex fixed w-fit",  // For mobile screens
                        "xl:w-[420px] xl:left-4"         // For laptop screens and above
                    ),
                    description: `${senderName} says : ${message}`
                });
            }
        },
        onOldMessagesReceived,
    });
    const handleSendMessage = (e) => {
        e.preventDefault();

        if (message) {
            send(message, { persist: true });
        }
        setMessage("");
    };
    return (
        <>
            <div
                className={`w-full h-full flex flex-col justify-between bg-gray-100   mx-auto `}>

                <div
                    className={'p-4 mr-4  bg-gray-100 bg-background text-foreground text-xl flex items-center font-bold  font-medium rounded-t-2xl gap-2'}>
                   <Chatbox/>
                    {t("Chat with Agent")}</div>
                <hr className=" bg-blue-50 h-0.5"/>
                <ChatMessages/>
                <form onSubmit={handleSendMessage} className="  rounded-b-3xl mb-2   p-3 flex gap-2">
                    <Input value={message}
                           onChange={(e) => {
                               setMessage(e.target.value);
                           }} placeholder={t("chatBoxPlaceholder")}
                           className="flex-1  rounded-md border-blue-100 border-2 border-border text-foreground  h-11 px-3 py-2 text-sm"/>
                    <Button size="sm" type={'submit'} onClick={handleSendMessage}
                            className={'h-full rounded-sm bg-primary text-primary-foreground'}>

                        {message.trim() ? (
                            <Arrowchat/>

                        ) : (
                           <Arrowchatupward/>
                        )}
                    </Button>
                </form>
            </div>
        </>

    )
}

export default memo(ChatBox)

function ArrowUpIcon(props) {
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
            <path d="m5 12 7-7 7 7"/>
            <path d="M12 19V5"/>
        </svg>
    )
}

function json_verify(s) {
    try {
        JSON.parse(s);
        return true;
    } catch (e) {
        return false;
    }
};




