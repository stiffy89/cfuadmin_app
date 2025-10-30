import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataContextType, ServiceData, UserData } from '../types/AppTypes';

// create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [services, setServices] = useState<ServiceData[]>([])
    const [membershipDetails, setMembershipDetails] = useState<any[]>([])
    const [trainingHistoryDetails, setTrainingHistoryDetails] = useState<any[]>([])
    const [employeeDetails, setEmployeeDetails] = useState<any[]>([])
    const [volunteerDetails, setVolunteerDetails] = useState<any[]>([])
    const [objectsOnLoan, setObjectsOnLoan] = useState<any[]>([])
    const [medalsAwards, setMedalsAwards] = useState<any[]>([])
    const [myUnitContacts, setMyUnitContacts] = useState<any>([]);
    const [cfuPhonebookSuburbs, setCfuPhonebookSuburbs] = useState<any>([]);
    const [employeeAddresses, setEmployeeAddresses] = useState<any>([]);
    const [addressStates, setAddressStates] = useState<any>([]);
    const [addressRelationships, setAddressRelationships] = useState<any>([]);
    const [brigadeSummary, setBrigadeSummary] = useState<any>([]);

    const value: DataContextType = {
        services,
        setServices,
        membershipDetails,
        setMembershipDetails,
        trainingHistoryDetails,
        setTrainingHistoryDetails,
        employeeDetails,
        setEmployeeDetails,
        volunteerDetails,
        setVolunteerDetails,
        objectsOnLoan,
        setObjectsOnLoan,
        medalsAwards,
        setMedalsAwards,
        employeeAddresses,
        setEmployeeAddresses,
        addressStates,
        setAddressStates,
        addressRelationships,
        setAddressRelationships,
        myUnitContacts,
        setMyUnitContacts,
        cfuPhonebookSuburbs,
        setCfuPhonebookSuburbs,
        brigadeSummary,
        setBrigadeSummary
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
