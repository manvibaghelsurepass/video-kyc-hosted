import {Button} from "/src/components/ui/button"
import CropImage from "/src/components/CropImage.jsx";
import {cn} from "/src/lib/utils.js";
import {ToastAction} from "/src/components/ui/toast.jsx";
import axios from "axios";
import {useToast} from "/src/components/ui/use-toast.js";
import {lowerCase, startCase, upperCase} from "lodash";
import {useDispatch, useSelector} from "react-redux";
import {setIsValidPANValidate, setOCRResultData, setPanValidCall, setShowPANValidate} from "/src/slices/socket.js";
import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion"


export default function DocumentVerify({imageType, imageCapture, Base64, setBase64, currentStep, dummyImage}) {
    const {
        OCRResultData,
        panValidCall,
        panImage,
        isValidPANValidate,
        showPANValidate
    } = useSelector(state => state.SocketHandle)
    const {queryParams} = useSelector(state => state.appSlice);
    const {toast} = useToast()
    const dispatch = useDispatch()


    function base64ToFile(base64String, defaultFileName = 'image', mimeType = 'image/png') {
        try {
            // Log the Base64 string to verify its structure
            console.log('Base64 String:', base64String);

            // Decode the Base64 string (use Buffer in Node.js)
            const bstr = atob(base64String);
            console.log('Binary String:', bstr);

            // Create a Uint8Array to hold the binary data
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            // Dynamically set the file extension based on the provided MIME type
            const extension = mimeType.split('/')[1];  // Get extension from MIME type (e.g., jpeg, png, gif)
            const fileName = `${defaultFileName}.${extension}`;  // Use default file name with extension

            // Create and return the File object
            console.log('File Name:', fileName);
            return new File([u8arr], fileName, {type: mimeType});

        } catch (error) {
            console.error('Error converting Base64 to File:', error);
            return null;
        }
    }

    const checkPANOCR = async () => {
        try {
            const payload = new FormData()
            payload.append('file', base64ToFile(Base64, 'PAN_Image', 'image/jpeg'))
            const response = await axios.post(`${import.meta.env.VITE_SUPERFLOW_BASE_URL}/api/v1/surepass/pan-ocr`, payload, {
                headers: {
                    Authorization: `Bearer ${queryParams?.superflow_token}`
                }
            })
            dispatch(setOCRResultData(response?.data?.data?.ocr_fields[0]))

            const result = await axios.post(`${import.meta.env.VITE_SUPERFLOW_BASE_URL}/api/v1/surepass/pan-validate`, {pan_number: response?.data?.data?.ocr_fields[0]?.pan_number?.value}, {
                headers: {
                    Authorization: `Bearer ${queryParams?.superflow_token}`
                }
            })
            dispatch(setPanValidCall(true))
            console.log(result?.data?.data?.full_name, 'response')

            dispatch(setShowPANValidate(true))
            dispatch(setIsValidPANValidate(true));


        } catch (err) {
            toast({
                className: cn(
                    "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4"
                ),
                variant: "destructive",
                title: (
                    <h1>
                        {err?.response?.data?.status_code} {err?.response?.data?.message}
                    </h1>
                ),
                description:
                    startCase(err?.response?.data?.data?.remarks) ||
                    err?.response?.data?.message ||
                    "There was a problem with your request.",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
            dispatch(setShowPANValidate(true))
            dispatch(setIsValidPANValidate(false))

        }
    }

    useEffect(() => {
        if (panImage && !panValidCall) {
            checkPANOCR()
        }
    }, [panImage])

    return (
        <div className="container mx-auto p-6 max-w-5xl bg-card border-none shadow-none rounded-lg">
            <div className="space-y-8">
                <div className="grid grid-cols-1  md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-base  font-medium text-card-foreground">PAN Capture</h2>
                        <CropImage imageType={imageType} current={currentStep} dummyImage={dummyImage}
                                   setBase64={setBase64} Base64={Base64} imageCapture={imageCapture}/>
                    </div>
                </div>

                {Object.keys(OCRResultData).length ? <div className="space-y-2">
                    <section className={'flex justify-between '}>
                        <h2 className="text-base font-medium text-card-foreground">Document OCR Results</h2>
                        {showPANValidate && <PanValidateAnimation IsValid={isValidPANValidate}/>}
                    </section>
                    {
                        Object.keys(OCRResultData).map((row, index) => (
                            <div key={index}
                                 className="flex items-center space-x-2 py-1.5 border-b border-border last:border-b-0">
                                <div className="flex items-center gap-1.5 text-primary min-w-[220px]">
                                    <label
                                        className="text-xs text-card-foreground  font-medium">{startCase(lowerCase(row))}</label>
                                </div>
                                <span className="text-muted-foreground">:</span>
                                <p className="text-xs font-medium text-card-foreground flex-1 truncate">
                                    {OCRResultData[row]?.value ? OCRResultData[row]?.value : upperCase(OCRResultData[row])}
                                </p>
                            </div>
                        ))
                    }
                </div> : null}
            </div>
        </div>
    )
}


export function PanValidateAnimation({IsValid}) {
    console.log(IsValid, 'isvalid')
    const [validationState, setValidationState] = useState(IsValid ? 'valid' : 'invalid')
    useEffect(() => {
        setValidationState(IsValid ? 'valid' : 'invalid')
    }, [IsValid])

    const containerVariants = {
        hidden: {opacity: 0, y: -20},
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {duration: 0.3, ease: "easeIn"}
        }
    }

    const itemVariants = {
        hidden: {opacity: 0, y: 10},
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                type: "spring",
                stiffness: 100
            }
        }
    }

    const iconVariants = {
        hidden: {pathLength: 0, opacity: 0},
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        }
    }

    const getMessage = () => {
        switch (validationState) {
            case "valid":
                return "PAN is valid"
            case "invalid":
                return "PAN is invalid"
            default:
                return ""
        }
    }

    const getColor = () => {
        switch (validationState) {
            case "valid":
                return "green"
            case "invalid":
                return "red"
            default:
                return "gray"
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={validationState}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center space-x-3"
                >
                    <motion.div
                        className={`rounded-full bg-${getColor()}-500 p-1`}
                        variants={itemVariants}
                    >
                        <motion.svg
                            className="h-4 w-4 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {validationState === "valid" ? (
                                <motion.path
                                    d="M20 6L9 17l-5-5"
                                    variants={iconVariants}
                                />
                            ) : (
                                <>
                                    <motion.path d="M18 6L6 18" variants={iconVariants}/>
                                    <motion.path d="M6 6l12 12" variants={iconVariants}/>
                                </>
                            )}
                        </motion.svg>
                    </motion.div>
                    <motion.span
                        className={`text-${getColor()}-700 font-medium`}
                        variants={itemVariants}
                    >
                        {getMessage()}
                    </motion.span>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
