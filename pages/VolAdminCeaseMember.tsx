import React from 'react';
import {View} from 'react-native';
import CustomText from '../assets/CustomText';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';

type props = StackScreenProps<RootStackParamList, 'VolAdminCeaseMember'>; 

const VolAdminCeaseMember = ({route} : props) => {
    return (
        <View>
            <CustomText>Cease Member</CustomText>
        </View>
    )
}

export default VolAdminCeaseMember;