//generic context that will wrap the whole app
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthType, SecurityContextType } from '../types/AppTypes';


// create the context
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// provider component
export const SecurityProvider = ({ children }: { children: ReactNode }) => {

  //IF YOU CHANGE ANYTHING HERE, CHANGE THE TYPE ASWELL!!!

  const [isLoggedIn, setIsLoggedIn] = useState(false); //<-- is the user currently authenticated?
  const [isAuthenticating, setIsAuthenticating] = useState(false); //<-- are we in the process of some type of authentication? Important for app state
  const [authType, setAuthType] = useState<AuthType>('okta'); //<-- authentication type
  const [authErrorMessage, setAuthErrorMessage] = useState(''); //<-- if there is an error message, most for pin related stuff
  
  const value: SecurityContextType = {
    isLoggedIn, 
    setIsLoggedIn,
    isAuthenticating,
    setIsAuthenticating,
    authType,
    setAuthType,
    authErrorMessage,
    setAuthErrorMessage
  };

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

// custom hook for using this context
export const useSecurityContext = () : SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
