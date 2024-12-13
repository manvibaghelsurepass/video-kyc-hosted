import React from 'react';
import { Clock, Headphones, Heart, Globe, RefreshCcw } from 'lucide-react';
import { Button } from "/src/components/ui/button"
import Agent from "/src/components/svg/agentsvg/Agent.jsx";
const AgentsUnavailable = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {/* URL Bar */}


            {/* Main Content */}
            <div className="flex flex-col items-center px-2  mb-12 ">
                {/* Illustration */}
                <div className="relative w-64 h-64 mb-12">
                    <div className="absolute inset-0 rounded-3xl bg-navy-50"/>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                        <div className="relative">
                            <div className="w-32 h-32 bg rounded-full flex items-center justify-center">
                               <Agent/>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                    Agents Unavailable
                </h1>
                <p className="text-gray-700 text-lg font-poopin font-base  text-center mb-9">
                    Apologies, no agents are available at the <br/> moment.
                </p>
                <Button
                    className="w-full sm:w-3/4 md:w-3/4 lg:w-4/5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-lg py-6 mt-2 rounded-sm"
                    size="lg"
                >
                    Come Back Later
                </Button>

                <p
                    className="text-gray-500 text-center mt-1 sm:mt-6 md:mt-8 lg:mt-6 text-sm sm:text-base md:text-lg lg:text-xl font-poopin px-4"
                >
                    Thanks for your patience! We&apos;ll reach out soon <br/>to help you reschedule your video KYC.
                </p>

            </div>
        </div>
    );
};

export default AgentsUnavailable;
