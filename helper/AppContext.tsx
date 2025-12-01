//generic context that will wrap the whole app
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppContextType } from '../types/AppTypes';


// create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [showBusyIndicator, setShowBusyIndicator] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [showDialogCancelButton, setShowDialogCancelButton] = useState(false);
  const [dialogActionButtonText, setDialogActionButtonText] = useState('OK');
  const [dialogActionFunction, setDialogActionFunction] = useState<(() => void) | undefined>(undefined);
  
  const [appLastActiveTimestamp, setAppLastActiveTimestamp] = useState<string>('');

  const [cardModalVisible, setCardModalVisible] = useState(false)

  const value: AppContextType = {
    showDialogCancelButton,
    setShowDialogCancelButton,
    dialogActionButtonText,
    setDialogActionButtonText,
    dialogActionFunction,
    setDialogActionFunction,
    showDialog,
    setShowDialog,
    showBusyIndicator,
    setShowBusyIndicator,
    dialogMessage,
    setDialogMessage,
    appLastActiveTimestamp,
    setAppLastActiveTimestamp,
    cardModalVisible,
    setCardModalVisible,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// custom hook for using this context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
