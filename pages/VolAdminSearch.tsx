import React from 'react';
import {View} from 'react-native';
import CustomText from '../assets/CustomText';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';


type props = StackScreenProps<RootStackParamList, 'VolAdminSearch'>; 

const VolAdminSearch = ({route} : props) => {
    return (
        <View>
            <CustomText>Search Member</CustomText>
        </View>
    )
}

export default VolAdminSearch;