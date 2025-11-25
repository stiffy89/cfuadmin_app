import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HelperValuesDataContextType} from '../types/AppTypes';

// create the context that holds all our helper values
const HelperValuesDataContext = createContext<HelperValuesDataContextType | undefined>(undefined);

export const HelperValuesDataProvider = ({ children }: { children: ReactNode }) => {
    const [cessationReasons, setCessationReasons] = useState<any>([]);
    const [addressStates, setAddressStates] = useState<any>([]);
    const [addressRelationships, setAddressRelationships] = useState<any>([]);
    const [membershipTypes, setMembershipTypes] = useState<any>([]);
    const [membershipStatuses, setMembershipStatuses] = useState<any>([]);
    const [positionHistoryHelperValue, setPositionHistoryHelperValue] = useState<any>([]);
    const [volunteerStatuses, setVolunteerStatuses] = useState<any>([]); 
    const [equityGenderValues, setEquityGenderValues] = useState<any>([]);
    const [equityAboriginalValues, setEquityAboriginalValues] = useState<any>([]);
    const [equityRacialEthnicReligiousValues, setEquityRacialEthnicReligiousValues] = useState<any>([]);
    const [equityFirstLanguageValues, setEquityFirstLanguageValues] = useState<any>([]);
    const [equityNESLValues, setEquityNESLValues] = useState<any>([]);
    const [equityDisabilityValues, setEquityDisabilityValues] = useState<any>([]);

    const value: HelperValuesDataContextType  = {
        cessationReasons,
        setCessationReasons,
        addressStates,
        setAddressStates,
        addressRelationships,
        setAddressRelationships,
        membershipTypes,
        setMembershipTypes,
        membershipStatuses,
        setMembershipStatuses,
        volunteerStatuses,
        setVolunteerStatuses,
        positionHistoryHelperValue,
        setPositionHistoryHelperValue,
        equityGenderValues,
        setEquityGenderValues,
        equityAboriginalValues,
        setEquityAboriginalValues,
        equityRacialEthnicReligiousValues,
        setEquityRacialEthnicReligiousValues,
        equityFirstLanguageValues,
        setEquityFirstLanguageValues,
        equityNESLValues,
        setEquityNESLValues,
        equityDisabilityValues,
        setEquityDisabilityValues
    };

    return <HelperValuesDataContext.Provider value={value}>{children}</HelperValuesDataContext.Provider>;
}

// custom hook for using this context
export const useHelperValuesDataContext = (): HelperValuesDataContextType => {
    const context = useContext(HelperValuesDataContext);
    if (!context) {
        throw new Error('useDataContext must be used within an AppProvider');
    }
    return context;
};