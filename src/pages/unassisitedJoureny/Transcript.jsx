import { Constants, useTranscription } from "@videosdk.live/react-sdk";

function onTranscriptionStateChanged(data) {
    const { status, id } = data;

    if (status === Constants.transcriptionEvents.TRANSCRIPTION_STARTING) {
        console.log("Realtime Transcription is starting", id);
    } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STARTED) {
        console.log("Realtime Transcription is started", id);
    } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STOPPING) {
        console.log("Realtime Transcription is stopping", id);
    } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STOPPED) {
        console.log("Realtime Transcription is stopped", id);
    }
}
const scriptWordsArray = useMemo(()=>{
    return customerScript?.length? customerScript?.split(' '):[]
},[customerScripts])

function onTranscriptionText(data) {
    let { participantId, participantName, text, timestamp, type } = data;
    
    console.log(`${participantName}: ${text} ${timestamp}`);
}

const { startTranscription, stopTranscription } = useTranscription({
    onTranscriptionStateChanged,
    onTranscriptionText,
});
