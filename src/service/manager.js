

// export const userInitializeAPI = (signature) => axiosManager.post(`/api/v1/user/initialize/verify/${signature}`)
// export const getHintAPI = () => axiosManager.get('/api/v1/interface/peek');
// export const getBrandingDetailsAPI = () => axiosManager.get(/api/v1/workflows/organization-brand-details);
// export const callNextEventAPI = (payload) => axiosManager.post('/api/v1/interface/next, payload);
// export const getBrandingDetailsAPI = () => axiosManager.get('/api/v1/interface/brand);
// export const getDownloadIconAPI = () => axiosManager.get('/api/v1/interface/brand/icon, {responseType: 'arraybuffer'});
// export const getInterfaceSession = () => axiosManager.get('/api/v1/interface/session);

import {axiosInstance,videoKycAxiosInstance} from "/src/axiosinstance/axiosinstance.js";

export const getReplaySession = () => axiosInstance.get('/api/v1/interface/replay');
// export const getProgressStateAPI = () => axiosManager.get('/api/v1/interface/session/progress);
// export const getSurepassBlocksAPI = () => axiosManager.get('/api/v1/workflows/blocks);

export const fetchQuestionariesAPI = () => videoKycAxiosInstance.get(`/api/v1/vkyc/agent/fetch-questionnaire`);
export const submitQuestionariesAPI = (payload) => videoKycAxiosInstance.post(`/api/v1/vkyc/agent/submit-questionnaire`, payload);
