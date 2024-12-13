import React from "react";

export default function Wave() {
    return (
        <>
            <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <clipPath id="wave-clip">
                        <circle cx="50" cy="50" r="46"/>
                    </clipPath>
                </defs>
                <g clipPath="url(#wave-clip)">
                    <path
                        d="M0 50 Q 25 30 50 50 T 100 50 T 150 50 T 200 50 V100 H0 Z"
                        fill="#3B82F633"
                    >
                        <animate
                            attributeName="d"
                            values="
          M0 50 Q 25 30 50 50 T 100 50 T 150 50 T 200 50 V100 H0 Z;
          M0 50 Q 25 70 50 50 T 100 50 T 150 50 T 200 50 V100 H0 Z;
          M0 50 Q 25 30 50 50 T 100 50 T 150 50 T 200 50 V100 H0 Z"
                            dur="4s"
                            repeatCount="indefinite"
                        />
                    </path>
                </g>
            </svg>
        </>
    )
}