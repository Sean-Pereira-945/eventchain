import api from './api';

export const issueCertificate = (payload) => api.post('/certificates/issue', payload);
export const getMyCertificates = () => api.get('/certificates/my-certificates');
export const verifyCertificate = (hash) => api.get(`/certificates/verify/${hash}`);
export const getCertificateQr = (hash, size) => api.get(`/certificates/qr/${hash}`, { params: { size } });
export const getBlockchain = (params = {}) => api.get('/certificates/blockchain', { params });
