const STORAGE_KEY = 'eventchain_encryption_salt';

const getCrypto = () => (typeof window !== 'undefined' ? window.crypto || window.msCrypto : null);

const getSalt = () => {
  const cryptoRef = getCrypto();
  let salt = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (!salt) {
    if (!cryptoRef) return 'fallback-salt';
    salt = cryptoRef.getRandomValues(new Uint32Array(1))[0].toString(16);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, salt);
    }
  }
  return salt;
};

export const hashValue = async (value) => {
  const cryptoRef = getCrypto();
  if (!cryptoRef?.subtle) return value;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${value}${getSalt()}`);
  const digest = await cryptoRef.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const encodeToken = (token) => btoa(`${token}.${getSalt()}`);

export const decodeToken = (encoded) => {
  try {
    return atob(encoded).split('.')[0];
  } catch (error) {
    return null;
  }
};
