import React from "react";

export default function Circle() {
    return (
        <>
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Outer circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="4"
                />
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4"
                    strokeDasharray="301.59" /* Circumference = 2 * π * r */
                    strokeDashoffset={(301.59 * (119 - totalTimeLeft)) / 119} /* Swap logic for progress */
                    transform="rotate(-90 50 50)" /* Start at the top */
                />
            </svg>


            </>
            )
            }