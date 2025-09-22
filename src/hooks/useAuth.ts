import { useState, useEffect, createContext, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock authentication for demonstration
export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('clearaquatics-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Mock authentication - in real app, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    if (email && password) {
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0]
      };
      setUser(mockUser);
      localStorage.setItem('clearaquatics-user', JSON.stringify(mockUser));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true);
    
    // Mock registration - in real app, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    if (email && password && name) {
      const mockUser: User = {
        id: '1',
        email,
        name
      };
      setUser(mockUser);
      localStorage.setItem('clearaquatics-user', JSON.stringify(mockUser));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('clearaquatics-user');
  };

  return {
    user,
    signIn,
    signUp,
    signOut,
    loading
  };
}

export { AuthContext };