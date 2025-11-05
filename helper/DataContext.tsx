import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataContextType, ServiceData, UserData } from '../types/AppTypes';

// create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [services, setServices] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any[]>([]);
    const [membershipDetails, setMembershipDetails] = useState<any[]>([])
    const [trainingHistoryDetails, setTrainingHistoryDetails] = useState<any[]>([])
    const [employeeDetails, setEmployeeDetails] = useState<any[]>([])
    const [volunteerRoles, setVolunteerRoles] = useState<any[]>([])
    const [objectsOnLoan, setObjectsOnLoan] = useState<any[]>([])
    const [medalsAwards, setMedalsAwards] = useState<any[]>([])
    const [myUnitContacts, setMyUnitContacts] = useState<any>([]);
    const [cfuPhonebookSuburbs, setCfuPhonebookSuburbs] = useState<any>([]);
    const [employeeAddresses, setEmployeeAddresses] = useState<any>([]);
    const [addressStates, setAddressStates] = useState<any>([]);
    const [addressRelationships, setAddressRelationships] = useState<any>([]);
    const [brigadeSummary, setBrigadeSummary] = useState<any>([]);
    const [rootOrgUnits, setRootOrgUnits] = useState<any>([]);
    const [orgUnitTeamMembers, setOrgUnitTeamMembers] = useState<any>([]);
    const [myOrgUnitDetails, setMyOrgUnitDetails] = useState<any>([]);
    const [myMembersMembershipDetails, setMyMembersMembershipDetails] = useState<any>([]);
    const [myMemberEmployeeDetails, setMyMemberEmployeeDetails] = useState<any>([]);
    const [currentProfile, setCurrentProfile] = useState<string>('');
    const [drillDetails, setDrillDetails] = useState<any>([]); //<-- drills per org unit zzplans
    const [memberDrillCompletion, setMemberDrillCompletion] = useState<any>([]); //<-- drill completions by members per org unit
    const [trainingSelectedOrgUnit, setTrainingSelectedOrgUnit] = useState<any>([]); //<-- this sets the selected org unit (be it root or drop down)

   
    const value: DataContextType = {
        services,
        setServices,
        currentUser,
        setCurrentUser,
        membershipDetails,
        setMembershipDetails,
        trainingHistoryDetails,
        setTrainingHistoryDetails,
        employeeDetails,
        setEmployeeDetails,
        volunteerRoles,
        setVolunteerRoles,
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
        setBrigadeSummary,
        rootOrgUnits,
        setRootOrgUnits,
        orgUnitTeamMembers,
        setOrgUnitTeamMembers,
        myOrgUnitDetails,
        setMyOrgUnitDetails,
        myMembersMembershipDetails,
        setMyMembersMembershipDetails,
        myMemberEmployeeDetails,
        setMyMemberEmployeeDetails,
        currentProfile,
        setCurrentProfile,
        drillDetails,
        setDrillDetails,
        memberDrillCompletion,
        setMemberDrillCompletion,
        trainingSelectedOrgUnit,
        setTrainingSelectedOrgUnit
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
