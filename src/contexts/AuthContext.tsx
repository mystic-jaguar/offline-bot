import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RegisteredUser, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default admin user if no users exist
    initializeDefaultUsers();
    
    // Check for saved user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({
          ...parsedUser,
          loginTime: new Date(parsedUser.loginTime),
          createdAt: new Date(parsedUser.createdAt)
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const initializeDefaultUsers = () => {
    const existingUsers = localStorage.getItem('registeredUsers');
    if (!existingUsers) {
      const defaultUsers: RegisteredUser[] = [
        {
          id: 'admin-default',
          username: 'admin',
          password: 'admin123',
          email: 'admin@offline-chat.local',
          role: 'admin',
          createdAt: new Date(),
        },
        {
          id: 'user-default',
          username: 'user',
          password: 'user123',
          email: 'user@offline-chat.local',
          role: 'user',
          createdAt: new Date(),
          createdBy: 'admin-default'
        }
      ];
      localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
    }
  };

  const getUsers = (): RegisteredUser[] => {
    const users = localStorage.getItem('registeredUsers');
    if (!users) return [];
    try {
      return JSON.parse(users).map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt)
      }));
    } catch {
      return [];
    }
  };

  const saveUsers = (users: RegisteredUser[]) => {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const newUser: User = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        email: foundUser.email,
        loginTime: new Date(),
        createdAt: foundUser.createdAt,
        createdBy: foundUser.createdBy
      };
      
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (username: string, password: string, email: string): Promise<{ success: boolean; message: string }> => {
    const users = getUsers();
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }
    
    const newUser: RegisteredUser = {
      id: `user-${Date.now()}`,
      username,
      password,
      email,
      role: 'user',
      createdAt: new Date()
    };
    
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    
    return { success: true, message: 'Account created successfully! You can now login.' };
  };

  const addUser = async (username: string, password: string, email: string, role: 'admin' | 'user'): Promise<{ success: boolean; message: string }> => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Only admins can add users' };
    }
    
    const users = getUsers();
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }
    
    const newUser: RegisteredUser = {
      id: `${role}-${Date.now()}`,
      username,
      password,
      email,
      role,
      createdAt: new Date(),
      createdBy: user.id
    };
    
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    
    return { success: true, message: `${role} account created successfully!` };
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (!user || user.role !== 'admin') {
      return false;
    }
    
    const users = getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      signup, 
      addUser, 
      getUsers, 
      deleteUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
