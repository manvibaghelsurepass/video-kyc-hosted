import {createSlice} from "@reduxjs/toolkit";

const AppSilce = createSlice({
    name: "AppSilce",
    initialState: {
        queryStrings: null,
        loading: false,
        error: null,
        agentID: null,
        agentMicOn: false,
        agentWebcamOn: false,
        agentIsLocal : null,
        agentName: null,
        mode: null,
        agentMeetingId: null,
        croppedImage: null,
        participantId: null,
        token: null,
        SIGNCroppedImage : null,
        PANCroppedImage:null,
        isLocalName:'',
        webhook:'',
        queryParams:{},
        recording:false,
        faceImage:'',
        documentImage:'',
        theme: '',
        name : '',
        customer_email: '',
        vkycSessionKey: '',
        customerScript: '',
        questionarries: null,
        questionResponse:{},
        isFaceMatch: false,
        isDocumentVerify: false,
        isUserVerify: false,
        isDialogOpen : true,
        customerOrganizationName:'',
    },
    reducers: {
        setIsFaceMatch: (state, action) => {
            state.isFaceMatch = action.payload;
        },
        setIsDocumentVerify: (state, action) => {
            state.isDocumentVerify = action.payload;
        },
        setCustomerOrganizationName: (state, action) => {
            state.customerOrganizationName = action.payload;
        },
        setIsUserVerify: (state, action)=> {
            state.isUserVerify = action.payload;
        },
        setName: (state, action) => {
            state.name= action.payload.name;
        },
        setQuestonarries: (state, action) => {
            state.questionarries = action.payload;
        },
        setQuestionResponse: (state, action)=>{
            state.questionResponse = action.payload;
        },
        setCustomerScript:(state, action)=>{
            state.customerScript = action.payload?.trim();
        },
        setcustomer_email : (state, action)=> {
            state.customer_email = action.payload.customer_email;
        },
        setVkycSessionKey: (state, action)=> {
            state.vkycSessionKey = action.payload;
        },
        setModeTheme(state,{payload}){
            state.theme = payload
        },
        setFaceImage: (state, action) => {
            state.faceImage = action.payload;
        },
        setDocumentImage: (state, action) => {
            state.documentImage = action.payload;
        },
        setRecording:(state,{payload}) => {
            state.recording = payload;
        },
        setQueryParams: (state,{payload}) => {
            state.queryParams = payload;
        },
        setWebhook: (state, action) => {
            state.webhook = action.payload;
        },
        setIsLocal: (state, {payload}) => {
            state.isLocalName = payload
        },
        setPANCroppedImage: (state, {payload}) => {
            state.PANCroppedImage = payload
        },
        setSIGNCroppedImage: (state, {payload}) => {
            state.SIGNCroppedImage = payload
        },
        setToken: (state, {payload}) => {
            state.token = payload
        },
        setUserParticipantId: (state, {payload}) => {
            state.participantId = payload
        },
        setCroppedImage: (state, {payload}) => {
            state.croppedImage = payload
        },
        setMode: (state, {payload}) => {
            state.mode = payload
        },
        setAgentMeetingId: (state, {payload}) => {
            state.agentMeetingId = payload
        },
        setAgentID: (state, {payload}) => {
            state.agentID = payload
        },
        setAgentMicOn: (state, {payload}) => {
            state.agentMicOn = payload
        },
        setAgentWebcamOn: (state, {payload}) => {
            state.agentWebcamOn = payload
        },
        setAgentName: (state, {payload}) => {
            state.agentName = payload
        },
        setAgentIsLocal: (state, {payload}) => {
            state.agentIsLocal = payload
        },
        setIsDialogOpen:(state,{payload}) =>{
           state.isDialogOpen = payload
        },
        setQueryStrings: (state, {payload}) => {
            state.queryStrings = payload;
        }
    }
});

export const {
    setName,
    setQueryStrings,
    setcustomer_email,
    setModeTheme,
    setDocumentImage,
    setFaceImage,
    setRecording,
    setWebhook,
    setQueryParams,
    setCroppedImage,
    setIsLocal,
    setSIGNCroppedImage,
    setPANCroppedImage,
    setAgentId, setToken,
    setUserParticipantId,
    setAgentIsLocal,
    setAgentMeetingId,
    setMode,
    setAgentName,
    setAgentID,
    setAgentWebcamOn,
    setVkycSessionKey,
    setCustomerScript,
    setAgentMicOn,
    setQuestonarries,
    setQuestionResponse,
    setIsFaceMatch,
    setIsDocumentVerify,
    setIsUserVerify,
    setIsDialogOpen
    
} = AppSilce.actions;

export default AppSilce.reducer;
