import React from 'react';
import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '/src/components/ui/alert';
import { Button } from '/src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '/src/components/ui/card';

const AccessDeniedError = () => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-[#F8FAFC] flex items-center justify-center">
            {/* Surepass Logo */}
            <div className="hidden absolute top-6 left-6">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#246BFD] rounded-lg flex items-center justify-center text-white font-bold">
                        SP
                    </div>
                    <span className="text-gray-900 font-semibold">surepass</span>
                </div>
            </div>

            <div className="relative w-full max-w-2xl mx-auto px-4">
                <Card className="border-0 shadow-md bg-white">
                    <CardHeader>
                        <div className="flex flex-col items-center space-y-6 py-8">
                            <div className="relative">
                                <XCircle className="h-20 w-20 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-semibold text-gray-900">Access Denied</h2>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pb-10">
                        <Alert variant="destructive" className="bg-[#246BFD]/5 border-[#246BFD]/20 text-gray-700">
                            <AlertTriangle className="h-5 w-5 text-[#246BFD]" />
                            <AlertTitle className="text-lg font-semibold">Authentication Error</AlertTitle>
                            <AlertDescription className="text-gray-600">
                                Your signature has expired. Please refresh your session or contact support if the issue persists.
                            </AlertDescription>
                        </Alert>

                        <div className="text-gray-600 space-y-3 px-4">
                            <p className="text-lg">This could be due to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>An expired authentication token</li>
                                <li>Invalid or revoked access permissions</li>
                                <li>Session timeout</li>
                            </ul>
                        </div>
                    </CardContent>

                    <CardFooter className="hidden  justify-between py-8">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                            Go Back
                        </Button>
                        <Button
                            onClick={handleRefresh}
                            className="bg-[#246BFD] hover:bg-[#246BFD]/90 text-white flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh Session
                        </Button>
                    </CardFooter>
                </Card>

                {/* Footer Text */}
                <p className="text-center text-gray-500 mt-6">
                    If you believe this is an error, please contact support
                </p>
            </div>
        </div>
    );
};

export default AccessDeniedError;
