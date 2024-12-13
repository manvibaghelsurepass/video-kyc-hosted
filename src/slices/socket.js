import {createSlice} from "@reduxjs/toolkit";

const SocketHandle = createSlice({
    name: 'socketSlice',
    initialState: {
        socket: null,
        incomingCall: false,
        consentData: {},
        queueData: {},
        permissions: [],
        permissionsInterfaceBlockId: null,
        userDetails: {},
        OCRResultData: {},
        livenessScore: null,
        faceMatchScore: null,
        KYCData : [],
        panImage : null,
        faceImage : null,
        questionaryQuestion : '',
        receivedQuestionsOnUserScreen: '',
        frontCameraDevice : '',
        backCameraDevice : '',
        panValidCall : false,
        isRejecting : false,
        decision : 'PENDING',
        heartbeatId : null,
        isValidPANValidate : false,
        showPANValidate : false,
        userGeoLocation : {},
        replaySession: null,
        terminateEvent: null,
        socketsEvent: null,
        transcriptData: null,
        matchConsentWords: null,
        highlightedText: [],
        blockHighlightedText: [],
        successMatchWords: [],
        errorLock:false,
        lockIndex:null,
        unassistedParameters: null,
        recordingLoader: false,
        recordingState: false,
    },
    reducers: {
        setRecordingState: (state, {payload}) => {
            state.recordingState = payload;
        },
        setRecordingLoader: (state, {payload})=>{
          state.recordingLoader = payload;
        },
        setUnassistedParameters: (state, {payload})=>{
            state.unassistedParameters =  payload;
        },
        setLockIndex: (state, {payload})=>{
            state.lockIndex = payload;
        },
        setErrorLock: (state, {payload})=>{
            state.errorLock =  payload;
        },
        setBlockHighlightedText: (state, {payload})=>{
            state.blockHighlightedText =  payload;
        },
        setSuccessMatchWords:(state, {payload}) => {
            state.successMatchWords = payload;
        },
        setHighlightedText: (state, {payload})=>{
            state.highlightedText= payload;
        },
        setTranscriptData: (state, {payload})=>{
            console.log("Payload", payload);
            state.transcriptData = state.transcriptData? state.transcriptData+" "+payload:payload;
        },
        setMatchConsentWords: (state, {payload}) => {
            state.matchConsentWords =  state.matchConsentWords ? state.matchConsentWords + " " + payload: payload;
        },
        setSocketEvents: (state, {payload}) => {
            state.socketsEvent = state.socketsEvent?.length ? [...state.socketsEvent, payload] : payload;
        },
        setTerminateEvent: (state, {payload})=>{
            state.terminateEvent = payload;
        },
        setReplaySession: (state, {payload})=>{
            state.replaySession = payload;
        },
        setShowPANValidate : (state, {payload}) => {
            state.showPANValidate = payload
        },
        setIsValidPANValidate : (state, {payload}) => {
            state.isValidPANValidate = payload
        },
        setUserGeoLocation : (state, action) => {
            state.userGeoLocation = action.payload
        },
        setHeartbeat: (state, action) => {
            console.log("Hearbeat", action);
            state.heartbeatId = action.payload;
        },
        setIsRejecting: (state, action) => {
            state.isRejecting = action.payload;
        },
        setDecision(state, action) {
            state.decision = action.payload;
        },
        setPanValidCall(state, action) {
            state.panValidCall = action.payload;
        },
        setFrontCameraDevice (state, {payload}) {
            state.frontCameraDevice = payload;
        },
        setBackCameraDevice (state, {payload}) {
            state.backCameraDevice = payload;
        },
        setReceivedQuestions(state, action) {
            state.receivedQuestionsOnUserScreen = action.payload;
        },
        setQuestionaryQuestion(state, action) {
            state.questionaryQuestion = action.payload;
        },
        setFaceImage: (state, action) => {
            state.faceImage = action.payload;
        },
        setPanImage: (state, action) => {
            state.panImage = action.payload;
        },
        setKYCData (state, action) {
            state.KYCData = action.payload;
        },
        setLivenessScore: (state, action) => {
            state.livenessScore = action.payload
        },
        setFaceMatchScore: (state, action) => {
            state.faceMatchScore = action.payload
        },
        setOCRResultData(state, action) {
            state.OCRResultData = action.payload
        },
        setUserDetails: (state, action) => {
            state.userDetails = action.payload;
        },
        setPermissions: (state, action) => {
            state.permissions = action.payload;
        },
        setPermissionsInterfaceBlockId: (state, action) => {
            state.permissionsInterfaceBlockId = action.payload;
        },
        setSocket: (state, {payload}) => {
            state.socket = payload
        },
        setIncomingCall: (state, {payload}) => {
            state.incomingCall = payload
        },
        setConsentData: (state, {payload}) => {
            state.consentData = payload
        },
        setQueueData: (state, {payload}) => {
            state.queueData = payload
        }
    }
})
export const {

    setShowPANValidate,
    setIsValidPANValidate,
    setUserGeoLocation,
    setHeartbeat,
    setDecision,
    setIsRejecting,
    setPanValidCall,
    setBackCameraDevice,
    setFrontCameraDevice,
    setReceivedQuestions,
    setQuestionaryQuestion,
    setPanImage,
    setFaceImage,
    setKYCData,
    setFaceMatchScore,
    setLivenessScore,
    setOCRResultData,
    setUserDetails,
    setSocket,
    setPermissionsInterfaceBlockId,
    setPermissions,
    setQueueData,
    setConsentData,
    setIncomingCall,
    setReplaySession,
    setTerminateEvent,
    setSocketEvents,
    setTranscriptData,
    setMatchConsentWords,
    setHighlightedText,
    setSuccessMatchWords,
    setBlockHighlightedText,
    setLockIndex,
    setErrorLock,
    setUnassistedParameters,
    setRecordingLoader,
    setRecordingState
} = SocketHandle.actions
export default SocketHandle.reducer



