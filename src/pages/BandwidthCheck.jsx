import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "/src/components/ui/popover"
import { useParticipant } from "@videosdk.live/react-sdk";
import { Wifi } from "lucide-react";

const CornerDisplayName = ({
    participantId,
    isPresenting,
    displayName,
    isLocal,
    screenShareStream,
    webcamStream,
    micStream
}) => {
    const {
        webcamOn,
        getVideoStats,
        getAudioStats,
        getShareStats,
    } = useParticipant(participantId);

    const statsIntervalIdRef = useRef();
    const [score, setScore] = useState({});
    const [audioStats, setAudioStats] = useState({});
    const [videoStats, setVideoStats] = useState({});

    const updateStats = async () => {
        let stats = [];
        let audioStats = [];
        let videoStats = [];
        if (isPresenting) {
            stats = await getShareStats();
        } else if (webcamStream) {
            stats = await getVideoStats();
        } else if (micStream) {
            stats = await getAudioStats();
        }


        if (webcamStream || micStream || isPresenting) {
            videoStats = isPresenting ? await getShareStats() : await getVideoStats();
            audioStats = isPresenting ? [] : await getAudioStats();
        }

        let score = stats
            ? stats.length > 0
                ? getQualityScore(stats[0])
                : 100
            : 100;

        setScore(score);
        setVideoStats(videoStats);
        setAudioStats(audioStats);
    };

    const qualityStateArray = [
        { label: "", audio: "Audio", video: "Video" },
        {
            label: "Latency",
            audio:
                audioStats && audioStats[0]?.rtt ? `${audioStats[0]?.rtt} ms` : "-",
            video:
                videoStats && videoStats[0]?.rtt ? `${videoStats[0]?.rtt} ms` : "-",
        },
        {
            label: "Jitter",
            audio:
                audioStats && audioStats[0]?.jitter
                    ? `${parseFloat(audioStats[0]?.jitter).toFixed(2)} ms`
                    : "-",
            video:
                videoStats && videoStats[0]?.jitter
                    ? `${parseFloat(videoStats[0]?.jitter).toFixed(2)} ms`
                    : "-",
        },
        {
            label: "Packet Loss",
            audio: audioStats
                ? audioStats[0]?.packetsLost
                    ? `${parseFloat(
                        (audioStats[0]?.packetsLost * 100) / audioStats[0]?.totalPackets
                    ).toFixed(2)}%`
                    : "-"
                : "-",
            video: videoStats
                ? videoStats[0]?.packetsLost
                    ? `${parseFloat(
                        (videoStats[0]?.packetsLost * 100) / videoStats[0]?.totalPackets
                    ).toFixed(2)}%`
                    : "-"
                : "-",
        },
        {
            label: "Bitrate",
            audio:
                audioStats && audioStats[0]?.bitrate
                    ? `${parseFloat(audioStats[0]?.bitrate).toFixed(2)} kb/s`
                    : "-",
            video:
                videoStats && videoStats[0]?.bitrate
                    ? `${parseFloat(videoStats[0]?.bitrate).toFixed(2)} kb/s`
                    : "-",
        },
        {
            label: "Frame rate",
            audio: "-",
            video:
                videoStats &&
                    (videoStats[0]?.size?.framerate === null ||
                        videoStats[0]?.size?.framerate === undefined)
                    ? "-"
                    : `${videoStats ? videoStats[0]?.size?.framerate : "-"}`,
        },
        {
            label: "Resolution",
            audio: "-",
            video: videoStats
                ? videoStats && videoStats[0]?.size?.width === null
                    ? "-"
                    : `${videoStats[0]?.size?.width}x${videoStats[0]?.size?.height}`
                : "-",
        },
        {
            label: "Codec",
            audio: audioStats && audioStats[0]?.codec ? audioStats[0]?.codec : "-",
            video: videoStats && videoStats[0]?.codec ? videoStats[0]?.codec : "-",
        },
        {
            label: "Cur. Layers",
            audio: "-",
            video:
                videoStats && !isLocal
                    ? videoStats && videoStats[0]?.currentSpatialLayer === null
                        ? "-"
                        : `S:${videoStats[0]?.currentSpatialLayer || 0} T:${videoStats[0]?.currentTemporalLayer || 0
                        }`
                    : "-",
        },
        {
            label: "Pref. Layers",
            audio: "-",
            video:
                videoStats && !isLocal
                    ? videoStats && videoStats[0]?.preferredSpatialLayer === null
                        ? "-"
                        : `S:${videoStats[0]?.preferredSpatialLayer || 0} T:${videoStats[0]?.preferredTemporalLayer || 0
                        }`
                    : "-",
        },
    ];

    useEffect(() => {
        if (webcamStream || micStream) {
            updateStats();

            if (statsIntervalIdRef.current) {
                clearInterval(statsIntervalIdRef.current);
            }

            statsIntervalIdRef.current = setInterval(updateStats, 500);
        } else {
            if (statsIntervalIdRef.current) {
                clearInterval(statsIntervalIdRef.current);
                statsIntervalIdRef.current = null;
            }
        }

        return () => {
            if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
        };
    }, [webcamStream, micStream]);
    const formatBitrate = (bitrate) => {
        return bitrate > 1000 ? (bitrate / 1000).toFixed(2) + ' Mbps' : bitrate + ' kbps';
    };
    return (
        <>
            {(webcamStream || micStream || screenShareStream) && (
                <div className={`absolute ${ participantId !== 'AGENT' ? 'top-2 right-2' : 'top-0 right-0 hidden '} z-50 `}>
                    <Popover>
                        <PopoverTrigger className="rounded-md flex items-center justify-center p-1.5 cursor-pointer">
                            {videoStats && videoStats[0]?.bitrate ? (
                                <div
                                    className={`flex items-center space-x-2 backdrop-blur-2xl bg-white/30 z-80 mt-1 rounded-full px-1 py-1 ${
                                        score > 7
                                            ? "text-green-500 bg-green-100"
                                            : score > 4
                                                ? "text-yellow-500 bg-yellow-100"
                                                : "text-red-500 bg-red-100"
                                    }`}
                                >
                                    {score > 7 ? (
                                        <svg
                                            width="30"
                                            height="30"
                                            viewBox="0 0 30 30"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6.54688 15.7868C12.2802 11.3601 19.7335 11.3601 25.4669 15.7868"
                                                stroke="green"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M2.66699 11.1468C10.747 4.9068 21.2537 4.9068 29.3337 11.1468"
                                                stroke="green"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M9.05371 20.6534C13.2537 17.4 18.7337 17.4 22.9337 20.6534"
                                                stroke="green"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M12.5332 25.5335C14.6399 23.9068 17.3732 23.9068 19.4799 25.5335"
                                                stroke="green"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : score > 4 ? (
                                        <svg
                                            width="32"
                                            height="32"
                                            viewBox="0 0 32 32"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6.54688 15.7868C12.2802 11.3601 19.7335 11.3601 25.4669 15.7868"
                                                stroke="yellow"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M2.66699 11.1468C10.747 4.9068 21.2537 4.9068 29.3337 11.1468"
                                                stroke="yellow"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M9.05371 20.6534C13.2537 17.4 18.7337 17.4 22.9337 20.6534"
                                                stroke="yellow"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M12.5332 25.5335C14.6399 23.9068 17.3732 23.9068 19.4799 25.5335"
                                                stroke="yellow"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="32"
                                            height="32"
                                            viewBox="0 0 32 32"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6.54688 15.7868C12.2802 11.3601 19.7335 11.3601 25.4669 15.7868"
                                                stroke="red"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M2.66699 11.1468C10.747 4.9068 21.2537 4.9068 29.3337 11.1468"
                                                stroke="red"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M9.05371 20.6534C13.2537 17.4 18.7337 17.4 22.9337 20.6534"
                                                stroke="red"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M12.5332 25.5335C14.6399 23.9068 17.3732 23.9068 19.4799 25.5335"
                                                stroke="red"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                            ) : null}
                        </PopoverTrigger>
                    </Popover>

                </div>
            )}
        </>
    );
};

export default CornerDisplayName


export function getQualityScore(stats) {
    const packetLossPercent = stats.packetsLost / stats.totalPackets || 0;
    const jitter = stats.jitter;
    const rtt = stats.rtt;
    let score = 100;
    score -= packetLossPercent * 50 > 50 ? 50 : packetLossPercent * 50;
    score -= ((jitter / 30) * 25 > 25 ? 25 : (jitter / 30) * 25) || 0;
    score -= ((rtt / 300) * 25 > 25 ? 25 : (rtt / 300) * 25) || 0;
    return score / 10;
}


export function NetworkIcon(props) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M3.8 9.33333H2V13H3.8V9.33333Z" fill={props.color1} />
            <path d="M7.39998 7.5H5.59998V13H7.39998V7.5Z" fill={props.color2} />
            <path d="M11 5.20831H9.20001V13H11V5.20831Z" fill={props.color3} />
            <path d="M14.6 2H12.8V13H14.6V2Z" fill={props.color4} />
        </svg>
    );
}


export const nameTructed = (name, tructedLength) => {
    if (name?.length > tructedLength) {
        if (tructedLength === 15) {
            return `${name.substr(0, 12)}...`;
        } else {
            return `${name.substr(0, tructedLength)}...`;
        }
    } else {
        return name;
    }
};

export function SpeakerIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="21"
            fill="none"
            viewBox="0 0 20 21"
        >
            <path
                fill="#fff"
                d="M11 5.5a1.5 1.5 0 00-3 0v9a1.5 1.5 0 003 0v-9zM6 2.5a1.5 1.5 0 10-3 0v15a1.5 1.5 0 003 0v-15zM16 2.5a1.5 1.5 0 00-3 0v15a1.5 1.5 0 003 0v-15z"
            ></path>
        </svg>
    );
}

export const MicOffSmallIcon = ({ fillcolor }) => (
    <svg
        width={20}
        height={21}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <mask
            id="a"
            style={{
                maskType: "alpha",
            }}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={20}
            height={21}
        >
            <path fill="#D9D9D9" d="M0 .543h20v20H0z" />
        </mask>
        <g mask="url(#a)" fill={fillcolor ? fillcolor : "#050A0E"}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.167 9.453v1.256c0 .752.316 1.473.878 2.004.563.531 1.326.83 2.122.83.288 0 .572-.04.844-.115L7.167 9.453Zm4.929 5.096a4.72 4.72 0 0 1-1.93.41 4.638 4.638 0 0 1-3.181-1.244 4.134 4.134 0 0 1-1.319-3.006v-.337a.689.689 0 0 0-.22-.5.773.773 0 0 0-.53-.208.773.773 0 0 0-.53.207.689.689 0 0 0-.22.501v.337c0 2.89 2.29 5.275 5.25 5.624v1.46h-1.5a.773.773 0 0 0-.53.207.689.689 0 0 0-.22.501c0 .188.08.368.22.5.14.134.332.208.53.208h4.5c.2 0 .39-.074.53-.207a.689.689 0 0 0 .22-.501.689.689 0 0 0-.22-.5.773.773 0 0 0-.53-.208h-1.5v-1.46a6.246 6.246 0 0 0 2.226-.702l-1.046-1.082Zm3.466-1.36-1.119-1.157c.147-.423.223-.87.223-1.323v-.337c0-.188.08-.368.22-.5a.773.773 0 0 1 .53-.208c.2 0 .39.075.53.207.141.133.22.313.22.501v.337c0 .866-.21 1.713-.604 2.48Zm-2.395-2.477L7.21 4.555c.106-.57.395-1.1.834-1.516a3.092 3.092 0 0 1 2.122-.83c.795 0 1.558.299 2.12.83.563.532.88 1.252.88 2.004V10.712Z"
            />
            <rect
                x={2.755}
                y={3.043}
                width={20.816}
                height={1.515}
                rx={0.757}
                transform="rotate(45.956 2.755 3.043)"
            />
        </g>
    </svg>
);
