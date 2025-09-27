import { useAuth as useAuthContext } from '../context/AuthContext';

const useAuth = () => {
  const context = useAuthContext();
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
