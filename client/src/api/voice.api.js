import api from './axiosInstance.js';

export const parseVoiceTranscript = (transcript) =>
  api.post('/voice/parse', { transcript });
