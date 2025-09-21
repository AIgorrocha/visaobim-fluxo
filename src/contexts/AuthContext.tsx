import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserPoints: (points: number) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
const mockUsers: AuthUser[] = [
  {
    id: '1',
    email: 'igor@visaoprojetosbim.com',
    full_name: 'Igor',
    role: 'admin',
    points: 2500,
    level: 6,
    avatar_url: ''
  },
  {
    id: '2',
    email: 'gustavo@visaoprojetosbim.com',
    full_name: 'Gustavo',
    role: 'user',
    points: 850,
    level: 3,
    avatar_url: ''
  },
  {
    id: '3',
    email: 'bessa@visaoprojetosbim.com',
    full_name: 'Bessa',
    role: 'user',
    points: 650,
    level: 2,
    avatar_url: ''
  },
  {
    id: '4',
    email: 'leonardo@visaoprojetosbim.com',
    full_name: 'Leonardo',
    role: 'user',
    points: 1200,
    level: 4,
    avatar_url: ''
  },
  {
    id: '5',
    email: 'pedro@visaoprojetosbim.com',
    full_name: 'Pedro',
    role: 'user',
    points: 450,
    level: 2,
    avatar_url: ''
  },
  {
    id: '6',
    email: 'thiago@visaoprojetosbim.com',
    full_name: 'Thiago',
    role: 'user',
    points: 320,
    level: 2,
    avatar_url: ''
  },
  {
    id: '7',
    email: 'nicolas@visaoprojetosbim.com',
    full_name: 'Nicolas',
    role: 'user',
    points: 780,
    level: 3,
    avatar_url: ''
  },
  {
    id: '8',
    email: 'eloisy@visaoprojetosbim.com',
    full_name: 'Eloisy',
    role: 'user',
    points: 590,
    level: 2,
    avatar_url: ''
  },
  {
    id: '9',
    email: 'rondinelly@visaoprojetosbim.com',
    full_name: 'Rondinelly',
    role: 'user',
    points: 920,
    level: 3,
    avatar_url: ''
  },
  {
    id: '10',
    email: 'edilson@visaoprojetosbim.com',
    full_name: 'Edilson',
    role: 'user',
    points: 540,
    level: 2,
    avatar_url: ''
  },
  {
    id: '11',
    email: 'stael@visaoprojetosbim.com',
    full_name: 'Stael',
    role: 'user',
    points: 410,
    level: 2,
    avatar_url: ''
  },
  {
    id: '12',
    email: 'philip@visaoprojetosbim.com',
    full_name: 'Philip',
    role: 'user',
    points: 680,
    level: 3,
    avatar_url: ''
  },
  {
    id: '13',
    email: 'nara@visaoprojetosbim.com',
    full_name: 'Nara',
    role: 'user',
    points: 730,
    level: 3,
    avatar_url: ''
  },
  {
    id: '14',
    email: 'projetista.externo@visaoprojetosbim.com',
    full_name: 'Projetista Externo',
    role: 'user',
    points: 300,
    level: 2,
    avatar_url: ''
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('crm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (!foundUser) {
      setIsLoading(false);
      return false;
    }

    // Mock password validation (in real app, this would be handled by backend)
    const isValidPassword = password === 'admin@2025' || 
                           password === `${foundUser.full_name.toLowerCase()}@admin2025`;

    if (isValidPassword) {
      setUser(foundUser);
      localStorage.setItem('crm_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  const updateUserPoints = (points: number) => {
    if (user) {
      const updatedUser = { ...user, points };
      setUser(updatedUser);
      localStorage.setItem('crm_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserPoints, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};