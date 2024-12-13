import { Button } from "/src/components/ui/button"
import { Input } from "/src/components/ui/input"

export default function Instruction() {
    return (
        <div className="flex min-h-screen p-3">
            <aside className="w-1/4 rounded-lg p-8 bg-gray-50">
                <div className="flex items-center mb-8">
                    <LogInIcon className="w-6 h-6 text-primary" />
                    <h1 className="ml-2 text-xl font-semibold">Untitled UI</h1>
                </div>
                <ul className="space-y-6">
                    <li className="flex items-start space-x-2">
                        <CircleCheckIcon className="w-5 h-5 text-green-500" />
                        <div>
                            <h2 className="font-medium">Your details</h2>
                            <p className="text-sm text-muted-foreground">Please provide your name and email</p>
                        </div>
                    </li>
                    <li className="flex items-start space-x-2">
                        <CircleCheckIcon className="w-5 h-5 text-green-500" />
                        <div>
                            <h2 className="font-medium">Scan QR code</h2>
                            <p className="text-sm text-muted-foreground">Verify at least one device with 2FA</p>
                        </div>
                    </li>
                    <li className="flex items-start space-x-2">
                        <CircleIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <h2 className="font-medium">Choose a password</h2>
                            <p className="text-sm text-muted-foreground">Must be at least 8 characters</p>
                        </div>
                    </li>
                    <li className="flex items-start space-x-2">
                        <CircleIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <h2 className="font-medium">Invite your team</h2>
                            <p className="text-sm text-muted-foreground">Start collaborating with your team</p>
                        </div>
                    </li>
                    <li className="flex items-start space-x-2">
                        <CircleIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <h2 className="font-medium">Add your socials</h2>
                            <p className="text-sm text-muted-foreground">Share posts to your social accounts</p>
                        </div>
                    </li>
                </ul>

            </aside>
            <main className="flex flex-col items-center justify-center flex-1 p-8">
                <QrCodeIcon className="w-12 h-12 mb-4" />
                <h2 className="mb-2 text-2xl font-semibold">Scan QR code</h2>
                <p className="mb-8 text-center text-muted-foreground">Scan this QR code in-app to verify a device.</p>
                <img
                    src="/placeholder.svg"
                    alt="QR Code"
                    className="w-48 h-48 mb-4"
                    width="200"
                    height="200"
                    style={{ aspectRatio: "200/200", objectFit: "cover" }}
                />
                <p className="mb-4 text-muted-foreground">or enter the code manually</p>
                <div className="flex items-center w-full max-w-md mb-8 space-x-2">
                    <Input value="HLA8G4L1B9ZX4" readOnly className="flex-1" />
                    <Button variant="outline" size="icon">
                        <CopyIcon className="w-5 h-5" />
                    </Button>
                </div>
                <Button className="w-full max-w-md">Continue</Button>
            </main>
        </div>
    )
}

function CircleCheckIcon(props) {
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
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}


function CircleIcon(props) {
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
            <circle cx="12" cy="12" r="10" />
        </svg>
    )
}


function CopyIcon(props) {
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
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
    )
}


function LogInIcon(props) {
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
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" x2="3" y1="12" y2="12" />
        </svg>
    )
}


function QrCodeIcon(props) {
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
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v-1" />
        </svg>
    )
}
