import {useEffect, useState} from 'react'
import {Button} from "/src/components/ui/button"
import {Card, CardContent} from "/src/components/ui/card"
import {CreditCard, LoaderCircle} from "lucide-react"
import {PieChart, Pie, Cell, ResponsiveContainer} from 'recharts'
import CropImage from "/src/components/CropImage.jsx";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {cn} from "/src/lib/utils.js";
import {useToast} from "/src/components/ui/use-toast.js";
import {startCase} from "lodash";
import {ToastAction} from "/src/components/ui/toast.jsx";
import {setIsFaceMatch} from "/src/slices/appSlice.js";
import {setFaceMatchScore, setLivenessScore} from "/src/slices/socket.js";


export default function PhotoCapture({imageType, imageCapture, Base64, setBase64, currentStep, dummyImage}) {
    const {userDetails, faceMatchScore, faceImage, livenessScore} = useSelector(state => state.SocketHandle);
    const {queryParams} = useSelector(state => state.appSlice);
    const [idDocument, setIdDocument] = useState(null);
    const dispatch = useDispatch();
    const [loadingLiveness, setLoadingLiveness] = useState(false);
    const [loadingMatch, setLoadingMatch] = useState(false);
    const {toast} = useToast();

    useEffect(() => {
        setIdDocument(userDetails?.document);
    }, []);

    const getColorForPercentage = (percentage) => {
        if (percentage < 50) return '#e76e50' // Red for low percentages
        if (percentage < 75) return '#e8c468' // Yellow for medium percentages
        return '#2a9d90' // Green for high percentages
    }

    const renderCircularChart = (value, label) => {
        const data = [
            {name: label, value: value},
            {name: 'Remaining', value: 100 - value}
        ]

        const color = getColorForPercentage(value)
        const COLORS = [color, '#E5E7EB']

        return (
            <div className="h-24 w-24">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={30}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        )
    }

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

    const faceAPIs = async (endPoint) => {
        endPoint === 'face-match' ? setLoadingMatch(true) : setLoadingLiveness(true)
        const payload = new FormData()
        if (endPoint === 'face-match' && idDocument) {
            payload.append("selfie", base64ToFile(Base64, 'selfie', 'image/jpeg'))
            payload.append("selfie_2", base64ToFile(Base64, 'selfie_2', 'image/jpeg'))
            payload.append("id_card", base64ToFile(idDocument.split(',')[1], 'document_image', 'image/jpeg'))
        }
        if (endPoint === 'face-liveness') {
            payload.append("file", base64ToFile(Base64, 'liveness_image', 'image/jpeg'))
        }
        try {
            const response = await axios.post(`${import.meta.env.VITE_SUPERFLOW_BASE_URL}/api/v1/surepass/${endPoint}`, payload, {
                headers: {
                    'Authorization': `Bearer ${queryParams?.superflow_token}`
                }
            })
            console.log(response?.data)
            if (endPoint === 'face-liveness' && response) {
                dispatch(setLivenessScore(response?.data?.data?.model_output?.prob_real))


            }
            if (endPoint === 'face-match') {
                dispatch(setFaceMatchScore(response?.data?.data?.confidence))
            }

            dispatch(setIsFaceMatch(true));
        } catch (err) {
            console.log(err)
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
        finally {
            endPoint === 'face-match' ? setLoadingMatch(false) : setLoadingLiveness(false);
        }
    }

    useEffect(() => {
        const endPoints = ['face-match', 'face-liveness']
        if (faceImage && !livenessScore) {
            endPoints.forEach(endPoint => {
                console.log(endPoint, 'endPoints')
                faceAPIs(endPoint)
            })
        }
    }, [faceImage])


    return (
        <div className="container mx-auto p-1 max-w-6xl bg-card border-blue-400 shadow-none rounded-md">

            <div className="space-y-8">

                <div
                    className=" mt-5 p-5 border-blue-400  rounded-md grid grid-cols-1 md:grid-cols-2  border-2 ">
                    {/*<p className="mb-2 font-poppin text-lg font-semibold ">Face matching with document</p>*/}
                    <div className="space-y-1  w-[270px]  border-blue-300 border-2 rounded-sm">
                        <CropImage imageType={imageType} current={currentStep} dummyImage={dummyImage}
                                   setBase64={setBase64} Base64={Base64} imageCapture={imageCapture}/>
                    </div>

                    <div
                        className="flex items-center justify-center -ml-6  space-x-1 w-full"> {/* Flex container to align content horizontally */}
                        <div
                            className="flex items-center  justify-center -ml-7 h-[30vh]">
                            <svg width="90" height="90" viewBox="0 0 109 119" fill="none"
                                 xmlns="http://www.w3.org/2000/svg" className=" p-1 px-2 ">
                                <path
                                    d="M6 107.5C6 109.157 4.65684 110.5 2.99999 110.5C1.34313 110.5 0 109.157 0 107.5C0 105.843 1.34313 104.5 2.99999 104.5C4.65684 104.5 6 105.843 6 107.5Z"
                                    fill="#2563EA"/>
                                <path
                                    d="M108.57 94.5C108.57 96.1569 107.227 97.5 105.57 97.5C103.913 97.5 102.57 96.1569 102.57 94.5C102.57 92.8432 103.913 91.5 105.57 91.5C107.227 91.5 108.57 92.8432 108.57 94.5Z"
                                    fill="#2563EA"/>
                                <path d="M3 107.5H86.7291L106 93.5" stroke="#2563EA" stroke-miterlimit="10"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                                <path
                                    d="M6 89.5C6 91.1569 4.65684 92.5 2.99999 92.5C1.34313 92.5 0 91.1569 0 89.5C0 87.8432 1.34313 86.5 2.99999 86.5C4.65684 86.5 6 87.8432 6 89.5Z"
                                    fill="#2563EA"/>
                                <path
                                    d="M108.57 76.5C108.57 78.1569 107.227 79.5 105.57 79.5C103.913 79.5 102.57 78.1569 102.57 76.5C102.57 74.8432 103.913 73.5 105.57 73.5C107.227 73.5 108.57 74.8432 108.57 76.5Z"
                                    fill="#2563EA"/>
                                <path d="M3 89.5H86.7291L106 75.5" stroke="#2563EA" stroke-miterlimit="10"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                                <path
                                    d="M6 61.5C6 63.1569 4.65685 64.5 3 64.5C1.34315 64.5 0 63.1569 0 61.5C0 59.8431 1.34315 58.5 3 58.5C4.65685 58.5 6 59.8431 6 61.5Z"
                                    fill="#2563EA"/>
                                <path
                                    d="M108 61.5C108 63.1569 106.657 64.5 105 64.5C103.343 64.5 102 63.1569 102 61.5C102 59.8431 103.343 58.5 105 58.5C106.657 58.5 108 59.8431 108 61.5Z"
                                    fill="#2563EA"/>
                                <path d="M2 61.5L103 61.5" stroke="#2563EA" stroke-miterlimit="10"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                                <path
                                    d="M6 15.5C6 13.8431 4.65684 12.5 2.99999 12.5C1.34313 12.5 0 13.8431 0 15.5C0 17.1568 1.34313 18.5 2.99999 18.5C4.65684 18.5 6 17.1568 6 15.5Z"
                                    fill="#2563EA"/>
                                <path
                                    d="M107.57 30.5C107.57 28.8431 106.227 27.5 104.57 27.5C102.913 27.5 101.57 28.8431 101.57 30.5C101.57 32.1568 102.913 33.5 104.57 33.5C106.227 33.5 107.57 32.1568 107.57 30.5Z"
                                    fill="#2563EA"/>
                                <path d="M3 15.5L85.1033 15.5L104 29.5" stroke="#2563EA" stroke-miterlimit="10"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                                <path
                                    d="M6 33.5C6 31.8431 4.65684 30.5 2.99999 30.5C1.34313 30.5 0 31.8431 0 33.5C0 35.1568 1.34313 36.5 2.99999 36.5C4.65684 36.5 6 35.1568 6 33.5Z"
                                    fill="#2563EA"/>
                                <path
                                    d="M108 47.5C108 45.8431 106.657 44.5 105 44.5C103.343 44.5 102 45.8431 102 47.5C102 49.1568 103.343 50.5 105 50.5C106.657 50.5 108 49.1568 108 47.5Z"
                                    fill="#2563EA"/>
                                <path d="M3 33.5H85.9162L105 47.5" stroke="#2563EA" stroke-miterlimit="10"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <div className="space-y-1 w-[900px] h-[31vh] border-2 border-blue-300  rounded-sm">
                            <div className="rounded-sm  overflow-hidden h-full">
                                {idDocument ? (
                                    <img src={idDocument} alt="ID Document"
                                         className="w-full h-full rounded-lg object-cover"/>
                                ) : (
                                    <div
                                        className="w-full h-full flex justify-center items-center border-blue-300 border-2 rounded-sm">
                                        <div className="text-center">
                                            <CreditCard className="mx-auto h-13 w-13 text-card-foreground mb-2"/>
                                            <p className="text-gray-500 text-sm">No ID document received</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6  ">
                    {
                        loadingLiveness ?
                            <div
                                className="gap-2  w-full justify-center bg-slate-100 rounded-2xl border items-center flex  h-[150px] ">
                                <LoaderCircle className={'animate-spin'}/> Wait for Face Liveness result.
                            </div>
                            :
                            <>
                                <Card className="bg-card border-blue-400 border-2 p-4  bg-slate-50 shadow-sm">
                                    <CardContent className="p-4">
                                        <h3 className="text-base font-medium text-card-foreground mb-3">Liveness
                                            Check Result</h3>
                                        <div className={'grid grid-cols-5'}>
                                            <div className="flex col-span-4 items-center">
                                                {renderCircularChart(livenessScore ? Math.round(parseFloat(livenessScore) * 100) : 2, 'Liveness')}
                                                <div className="ml-4">
                                          <span className="text-2xl sm:text-3xl font-bold">
                                                 {Math.round(parseFloat(livenessScore) * 100) || 0}%
                                          </span>
                                                    <p className="text-xs sm:text-sm text-card-foreground">Liveness
                                                        Confidence</p>
                                                </div>
                                            </div>

                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                    }
                    {
                        loadingMatch ?
                            <div
                                className="gap-2 w-full justify-center bg-slate-100 rounded-2xl border items-center flex  h-[150px] ">
                                <LoaderCircle className={'animate-spin'}/> Wait for Face Match result.
                            </div>
                            :

                            <Card className="bg-slate-50 border-blue-400 p-4 border-2 shadow-sm  ">
                                <CardContent className="p-4">
                                    <h3 className="text-base font-medium text-card-foreground mb-3">Face Match
                                        Result</h3>
                                    <div className={'grid grid-cols-5'}>
                                        <div className="flex col-span-4 items-center">
                                            {renderCircularChart(faceMatchScore || 2, 'Face Match')}
                                            <div className="ml-4">
                                         <span className="text-2xl sm:text-3xl font-bold">
                                               {faceMatchScore || 0}%
                                         </span>
                                                <p className="text-xs sm:text-sm text-card-foreground">Face
                                                    Match
                                                    Confidence</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                    }
                </div>
            </div>
        </div>
    )
}
