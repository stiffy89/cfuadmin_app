import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataContextType, ServiceData, UserData } from '../types/AppTypes';

// create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<UserData>({
        firstname : '',
        lastname : '',
        pernr : ''
    });

    const [services, setServices] = useState<ServiceData[]>([])

    const value: DataContextType = {
        user,
        setUser,
        services,
        setServices
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// custom hook for using this context
export const useDataContext = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataContext must be used within an AppProvider');
    }
    return context;
};
