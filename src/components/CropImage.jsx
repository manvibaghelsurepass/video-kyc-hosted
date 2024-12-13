import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription, DialogClose
} from "/src/components/ui/dialog"
import {Button} from "/src/components/ui/button"
import {Camera, RefreshCcw} from "lucide-react";
import React, {memo, useEffect, useState} from "react";
import {Cropper} from "react-cropper";
import "cropperjs/dist/cropper.css";
import {useDispatch, useSelector} from "react-redux";
// import {
//     setCroppedImage,
//     setDocumentImage,
//     setFaceImage,
//     setPANCroppedImage,
//     setSIGNCroppedImage
// } from "/src/slices/appSlice.js";
import {useTranslation} from "react-i18next";
import {setFaceImage, setPanImage} from "/src/slices/socket.js";

function CropImage({current, Base64, imageType, imageCapture, dummyImage}) {
    const {t} = useTranslation();
    const [cropData, setCropData] = useState("#");
    const [cameraMode, setCameraMode] = useState(true);
    const [confirmImage, setConfirmImage] = useState('');
    const [cropper, setCropper] = useState();
    const [open, setOpen] = React.useState(false);
    const dispatch = useDispatch();
    const [cropButtonClicked, setCropButtonClicked] = useState(false);
    const [src, setSrc] = useState();
    const getCropData = () => {
        if (typeof cropper !== "undefined") {
            setCropData(cropper.getCroppedCanvas()?.toDataURL());
        }
    }
    const ConfirmImage = () => {
        console.log(imageType, 'imageType')
        if (typeof cropper !== "undefined") {
            setConfirmImage(cropper.getCroppedCanvas()?.toDataURL())
            if (imageType === 'face') {
                dispatch((setFaceImage(cropper.getCroppedCanvas()?.toDataURL())))
            } else if (imageType === 'document') {
                dispatch((setPanImage(cropper.getCroppedCanvas()?.toDataURL())))
            }
        }
    }


    function base64ToSrc(base64, mimeType = 'image/png') {
        return `data:${mimeType};base64,${base64}`;
    }

    let imageSrc = base64ToSrc(Base64, 'image/png');
    useEffect(() => {
        // setSrc(base64ToSrc(Base64, 'image/png'))
        return () => {
            setCropData('')
        }
    }, [src])
    console.log(dummyImage,'cropData')

    return (
        <div className={'flex flex-col gap-4'}>
            <div className="space-y-4">
                <div className="relative  rounded-sm  border-0 overflow-hidden shadow-inner">
                    {dummyImage ? (
                        <img src={dummyImage} alt="Captured" className="w-full h-[30vh] bg-secondary object-cover"/>
                    ) : (
                        <div
                            className="w-full flex justify-center items-center bg-secondary h-[30vh] object-contain">

                            <div className="flex flex-wrap gap-2">
                                    <Button className="bg-primary text-primary-foreground"
                                            onClick={() => {
                                                imageCapture()
                                                setOpen(true)
                                            }}
                                    >
                                        <Camera className="mr-2 h-4  w-4"/> Capture
                                    </Button>
                            </div>
                        </div>
                    )}
                </div>
                {dummyImage && <Button variant="outline" className="bg-secondary text-secondary-foreground"
                         onClick={() => {
                             imageCapture()
                             setCropData('#')
                             setOpen(true)
                         }}
                >
                    <RefreshCcw className="mr-2 h-4 w-4"/> Re-capture
                </Button>}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-4xl bg-yellow-400   p-1">
                    <div className=" space-y-2 flex-col items-center justify-between">
                        {/*<DialogHeader className={'flex justify-start text-start'}>*/}
                        {/*    <DialogTitle className={'text-lg'}>Crop Image</DialogTitle>*/}
                        {/*    <DialogDescription>Adjust the crop area to your liking.</DialogDescription>*/}
                        {/*</DialogHeader>*/}
                        <div className={'w-full gap-4'}>
                            <div className="relative rounded-sm">
                                <Cropper
                                    style={{
                                        height: "300px",
                                        width: "420px",
                                        objectFit: "contain",
                                    }}
                                    zoomTo={0.5}
                                    initialAspectRatio={1}
                                    preview=".img-preview"
                                    src={imageSrc}
                                    viewMode={1}
                                    minCropBoxHeight={10}
                                    minCropBoxWidth={10}
                                    background={false}
                                    responsive={true}
                                    autoCropArea={1}
                                    checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                                    onInitialized={(instance) => {
                                        setCropper(instance);
                                    }}
                                    guides={true}
                                    crossOrigin="anonymous"
                                />
                            </div>
                            {cropData !== '#' && cropButtonClicked && (
                                <div className="flex border-slate-300 border-2 rounded-md w-full">
                                    {/*<img*/}
                                    {/*    className="object-contain w-full h-[40vh]"*/}
                                    {/*    src={cropData}*/}
                                    {/*    alt="cropped"*/}
                                    {/*/>*/}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {/*<DialogClose asChild>*/}
                            <Button disabled={!imageSrc} onClick={() => {
                                setCropButtonClicked(true);
                                getCropData();
                            }} variant="outline">Crop</Button>
                            {/*</DialogClose>*/}
                            <DialogClose asChild>
                                <Button className="bg-blue-500 hover:bg-blue-600 hover:text-white text-white"
                                        onClick={() => {
                                            setCropButtonClicked(true);
                                            ConfirmImage();
                                        }}>Confirm</Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default memo(CropImage)
