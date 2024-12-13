"use client"

import {useEffect, useState} from "react";
import {Button} from "/src/components/ui/button";
import {Card, CardContent, CardFooter} from "/src/components/ui/card";
import {TooltipProvider} from "/src/components/ui/tooltip";
import {useDispatch, useSelector} from "react-redux";
import {setQuestionaryQuestion} from "/src/slices/socket.js";
import {startCase} from "lodash";
import {ScrollArea} from "/src/components/ui/scroll-area.jsx";
import {setQuestionResponse, setIsUserVerify} from "/src/slices/appSlice.js";
import {uppercaseWordsInString} from "../../utils/helperfunction.js";
import {useToast} from "/src/components/ui/use-toast.js";
import noQuestion from "/src/assets/questions.svg";
import {submitQuestionariesAPI} from "/src/service/manager.js";
import {cn} from "/src/lib/utils.js"
import {Loader2} from "lucide-react";
import {ToastAction} from "/src/components/ui/toast.jsx";

export default function QuestionAndAnswer({step}) {
    const dispatch = useDispatch();
    const {toast} = useToast();
    const [details, setDetails] = useState([
        {label: "Permanent Address", value: "Patna", matched: null},
        {label: "Pin code", value: "800008", matched: null},
        {label: "Place of Birth", value: "Bihar", matched: null},
        {label: "Email ID", value: "saurabh.kumar@surepass.io", matched: null},
        {label: "Occupation", value: "Software Engineer", matched: null},
        {label: "Mobile Number", value: "9973609777", matched: null},
    ]);
    const [submitLoader, setSubmitLoader] = useState(false);
    const {questionResponse, questionarries, isUserVerify} = useSelector(state => state.appSlice);

    const handleAsk = (index, question) => {
        dispatch(setQuestionaryQuestion(question))
        const newDetails = [...details]
        newDetails[index].asked = true
        setDetails(newDetails)
    }

    const handleAskAgain = (index) => {
        const newDetails = [...details]
        newDetails[index].asked = false
        newDetails[index].matched = null
        setDetails(newDetails)
    }

    const handleMatch = (key, value, action) => {
        const object = {...questionResponse};
        object[key] = action === 'match';
        dispatch(setQuestionResponse(object));
    }

    const getButtonStyles = (key, type) => {
        const isMatch = type === 'match'
        const hasResponse = key in questionResponse
        const isSelected = hasResponse && questionResponse[key] === isMatch

        if (!hasResponse) {
            return 'border border-border text-secondary-foreground bg-secondary'
        }
        if (isSelected) {
            return isMatch
                ? 'bg-green-600  hover:bg-green-600 hover:text-white text-white  shadow-inner'
                : 'bg-red-600 hover:bg-red-600 hover:text-white text-white  shadow-inner'
        }
        return 'border border-border text-secondary-foreground bg-secondary'
    }

    // const handleSubmit = () => {
    //     console.log("Submitted details:", questionResponse);
    //
    //     const responseArray = Object.entries(questionResponse).map(([key, value], index) => {
    //         return {
    //             "question": key,
    //             "match_status": value ? 'MATCHED' : 'MISMATCHED',
    //             "answer": questionarries[key],
    //
    //         }
    //     });
    //
    //     const responseObject = {
    //         submit_questionnaire: responseArray
    //     }
    //     setSubmitLoader(true);
    //     //call submit questionarries
    //     submitQuestionariesAPI(responseObject).then(res => {
    //         dispatch(setIsUserVerify(true));
    //     }).catch(err => {
    //         console.log("err", err);
    //         toast({
    //             className: cn(
    //                 "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4"
    //             ),
    //             variant: "destructive",
    //             title: (
    //                 <h1>
    //                     {err.response?.data?.status_code} {err?.response?.data?.message}
    //                 </h1>
    //             ),
    //             description:
    //                 startCase(err?.response?.data?.data?.remarks) ||
    //                 err?.response?.data?.message ||
    //                 "There was a problem with your request.",
    //             action: <ToastAction altText="Try again">Try again</ToastAction>,
    //         });
    //     }).finally(() => setSubmitLoader(false));
    // }

    const handleCancel = () => {
        setDetails(details.map(detail => ({...detail, matched: null, asked: false})))
    }



    return (
        <TooltipProvider>
            <Card className="w-full bg-card p-0 shadow-none border-none rounded-lg overflow-hidden">
                <CardContent className="py-2 px-2">
                    {questionarries ? <ScrollArea className={'min-h-[200px] h-[400px] p-4'}>
                        {Object.entries(questionarries)?.map(([key, value], index) => key !== 'client_id' && key !== 'user_id' && key !== 'document' ? (

                            <div key={index}
                                 className="flex items-center space-x-2 py-1.5 border-b border-border last:border-b-0">
                                <div className="flex items-center gap-1.5 text-primary min-w-[220px]">
                                    <label
                                        className="text-xs text-card-foreground  font-semibold">{uppercaseWordsInString(startCase(key))}</label>
                                </div>
                                <p className="text-xs font-medium text-foreground flex-1 truncate" title={value}>
                                    {value}
                                </p>

                                <div className={'flex gap-x-2'}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMatch(key, value, 'mismatch')}
                                        className={`w-24 rounded-md  ${getButtonStyles(key, 'mismatch')}`}
                                    >

                                        Mismatch
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMatch(key, value, 'match')}
                                        className={`w-24 rounded-md ${getButtonStyles(key, 'match')}`}
                                    >
                                        Match
                                    </Button>
                                </div>
                            </div>
                        ) : null)}
                    </ScrollArea> : <div className={'flex flex-col justify-center items-center'}>
                        <img src={noQuestion} className={'max-w-[200px] object-contain'}/>
                        <p className={'text-md font-semibold text-gray-500 my-3'}>No Questions Available at the
                            Moment</p>
                    </div>}

                </CardContent>
                {/*<AnimatePresence>*/}
                {/*    {!allFieldsVerified && (*/}
                {/*        <motion.div*/}
                {/*            initial={{opacity: 0, height: 0}}*/}
                {/*            animate={{opacity: 1, height: "auto"}}*/}
                {/*            exit={{opacity: 0, height: 0}}*/}
                {/*            className="bg-card border-l-4 border-border border border-l-blue-400 p-4 mb-4 mx-6"*/}
                {/*        >*/}
                {/*            <div className="flex items-center">*/}
                {/*                <AlertCircle className="w-5 h-5 text-primary mr-2"/>*/}
                {/*                <p className="text-sm text-blue-700">*/}
                {/*                    Please select Match/Mismatch for all fields to proceed.*/}
                {/*                </p>*/}
                {/*            </div>*/}
                {/*        </motion.div>*/}
                {/*    )}*/}
                {/*</AnimatePresence>*/}
                <CardFooter className="flex justify-end space-x-4 p-4 hidden rounded-b-lg">

                    <Button
                        disabled={submitLoader || isUserVerify}
                        // onClick={handleSubmit}
                        className={`w-24 bg-primary text-primary-foreground`}
                    >
                        {submitLoader ?
                            <p className={'flex gap-x-2 items-center'}>
                                <Loader2 size={16} className={'animate-spin'}/>
                                <span>Loading</span>
                            </p>

                            : isUserVerify ? 'Submitted' : 'Submit'}

                    </Button>
                </CardFooter>
            </Card>
        </TooltipProvider>
    )
}
