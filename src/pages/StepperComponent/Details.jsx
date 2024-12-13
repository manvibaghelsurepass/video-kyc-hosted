import {Card, CardContent} from "/src/components/ui/card"
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import axios from "axios";
import {setKYCData, setUserDetails} from "/src/slices/socket.js";
import {lowerCase, startCase} from "lodash";


function maskAadhaar(number) {

    return String(number).split('').map((num, index) => {
        if (index < 8) {
            return 'X'
        } else {
            return num
        }
    }).join('');
}

function convertToLabelValue(data) {
    // Create an array to hold the result
    const result = [];

    // Iterate through the API data keys
    Object.keys(data).forEach(key => {
        if (key !== 'document') {
            result.push({label: key, value: key === 'aadhaar_number' ? maskAadhaar(data[key]) : data[key]});  // Create an object for each key-value pair
        }
    });

    return result;
}

export default function Details() {
    const {KYCData} = useSelector(state => state.SocketHandle)
    const {queryParams} = useSelector(state => state.appSlice);
    const dispatch = useDispatch();
    useEffect(() => {
        async function fetchUserDetails() {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SUPERFLOW_BASE_URL}/api/v1/vkyc/agent/fetch-kyc-hosted-data`, {
                    headers: {
                        Authorization: `Bearer ${queryParams?.superflow_token}` // Add optional chaining if queryParams might be undefined
                    }
                });
                const data = response?.data?.data;
                dispatch(setUserDetails(data))
                const formattedData = convertToLabelValue(data);
                dispatch(setKYCData(formattedData))
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        }

        if (queryParams?.email !== 'evolvebrands_caseconstructions_console@surepass.io') {
            fetchUserDetails()
        }
    }, []);


    return (
        <div className="w-full shadow-none bg-card rounded-md border-2 border-blue-400 p-3">
            <div className="p-1">
                <div className="space-y-2">
                    <table className="w-full border-collapse   border-gray-200">
                        <thead>
                        <tr className="bg-gray-100 ">
                            <th className="py-2 px-4 border border-gray-200 text-left font-medium text-gray-600">Label</th>
                            <th className="py-2 px-4 border border-gray-200 text-left font-medium text-gray-600">Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {KYCData?.map((detail, index) => (
                            <tr
                                key={index}
                                className="even:bg-gray-50 hover:bg-gray-100"
                            >
                                <td className="py-2 px-4 border border-gray-200 text-primary text-xs font-medium">
                                    {startCase(lowerCase(detail?.label))}
                                </td>
                                <td
                                    className="py-2 px-4 border border-gray-200 text-foreground text-xs font-medium truncate"
                                    title={detail?.value}
                                >
                                    {detail?.value || "---"}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
// <Card className="w-full shadow-none border border-border bg-card">
//     <CardContent className="p-4">
//         <div className="space-y-2">
//             {KYCData?.map((detail, index) => (
//                 <div key={index}
//                      className="flex items-center space-x-2 py-1.5 border-b border-border last:border-b-0">
//                     <div className="flex items-center gap-1.5 text-primary min-w-[220px]">
//                         <label
//                             className="text-xs text-card-foreground  font-medium">{startCase(lowerCase(detail?.label))}</label>
//                     </div>
//                     <span className="text-muted-foreground">:</span>
//                     <p className="text-xs font-medium text-foreground flex-1 truncate" title={detail?.value}>
//                         {detail?.value}
//                     </p>
//                 </div>
//             ))}
//         </div>
//     </CardContent>
// </Card>