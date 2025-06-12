import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;            
  username: string;      
  coins: number;         
  profile_picture_url?: string;  
}

interface AuthContextType {
  user: User | null;                
  loading: boolean;                 
  error: string | null;             
  login: (username: string, password: string) => Promise<void>;  
  signup: (username: string, password: string, profile_picture_url?: string) => Promise<void>;  
  logout: () => void;               
  updateProfile: (data: { username?: string; password?: string; profile_picture_url?: string }) => Promise<void>;  
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  updateProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user/profile');
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('http://localhost:8000/auth/login', {
        username,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, password: string, profile_picture_url?: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post('http://localhost:8000/auth/signup', {
        username,
        password,
        profile_picture_url,
      });
      await login(username, password);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (data: { username?: string; password?: string; profile_picture_url?: string }) => {
    try {
      setLoading(true);
      setError(null);
      await axios.put('http://localhost:8000/user/profile', data);

      await fetchUserProfile();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
