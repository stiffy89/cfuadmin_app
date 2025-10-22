import React, {useState} from 'react';
import {View} from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme, IconButton, TextInput, Button } from 'react-native-paper';
import CustomText from '../assets/CustomText';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import GlobalStyles from '../style/GlobalStyles';

type props = StackScreenProps<RootStackParamList, 'EditScreen'>; //typing the navigation props

const MyDetailsEdit = (data : any) => {

    const theme = useTheme();
    const [preferredName, setPreferredName] = useState<string>(data.preferredName);

    return (
        <View style={{paddingHorizontal: 20, flex: 1}}>
            <CustomText style={{marginBottom: 20}} variant='titleLargeBold'>My Details Edit</CustomText>
            <TextInput 
                label='Preferred Name' 
                mode='flat' 
                value={preferredName} 
                onChangeText={(text) => {
                    setPreferredName(text)
                }}
            />
            <Button 
                style={{
                    backgroundColor: theme.colors.primary,
                    ...GlobalStyles.floatingButtonBottom
                }} 
                mode='elevated' 
                textColor={theme.colors.background}
                onPress={() => screenFlowModule.onGoBack()}
            >
                Save
            </Button>
        </View>
    )
}

const ContactDetailsEdit = (data : any) => {

    const theme = useTheme();
    const dataObj = data.data;

    const key = Object.keys(dataObj)[0];
    
    type ContactDetailsEdit = {
        primarymobile: string,
        home: string,
        work: string,
        email: string,
        work_street: string,
        work_suburb: string,
        work_state: string,
        work_postcode: string
    }

    const [contactDetails, setContactDetails] = useState<ContactDetailsEdit>({
        primarymobile: (key == 'primarymobile') ? dataObj[key] : '', //<-- if it matches what we passed, use that otherwise just start with blanks
        home: (key == 'home') ? dataObj[key] : '',
        work: (key == 'work') ? dataObj[key] : '',
        email : (key == 'email') ? dataObj[key] : '',
        work_street : (key == 'work_address') ? dataObj[key].work_street : '',
        work_suburb : (key == 'work_address') ? dataObj[key].work_suburb : '',
        work_state : (key == 'work_address') ? dataObj[key].work_state : '',
        work_postcode : (key == 'work_address') ? dataObj[key].work_postcode : '',
    })

    return (
        <View style={{paddingHorizontal: 20, flex: 1}}>
            <CustomText style={{marginBottom: 20}} variant='titleLargeBold'>Contact Details Edit</CustomText>
            {
                (key == 'primarymobile') && <TextInput 
                    label='Primary Mobile' 
                    mode='flat' 
                    value={contactDetails.primarymobile} 
                    onChangeText={(text) => {
                        setContactDetails({
                            ...contactDetails,
                            primarymobile : text
                        })
                    }}
                />
            }
            {
                (key == 'home') && <TextInput 
                    label='Home Phone' 
                    mode='flat' 
                    value={contactDetails.home} 
                    onChangeText={(text) => {
                        setContactDetails({
                            ...contactDetails,
                            home : text
                        })
                    }}
                />
            }
            {
                (key == 'work') && <TextInput 
                    label='Work Phone' 
                    mode='flat' 
                    value={contactDetails.work} 
                    onChangeText={(text) => {
                        setContactDetails({
                            ...contactDetails,
                            work : text
                        })
                    }}
                />
            }
            {
                (key == 'email') && <TextInput 
                    label='Email' 
                    mode='flat' 
                    value={contactDetails.email} 
                    onChangeText={(text) => {
                        setContactDetails({
                            ...contactDetails,
                            email : text
                        })
                    }}
                />
            }
            {
                
                (key == 'work_address') && 
                <View>
                    <CustomText style={{marginBottom: 20}} variant='titleSmallBold'>Work Address
                    </CustomText>
                    <TextInput 
                        label='Street' 
                        mode='flat'
                        style={{marginBottom: 20}} 
                        value={contactDetails.work_street} 
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                work_street : text
                            })
                        }}
                    />
                    <TextInput 
                        label='Suburb' 
                        mode='flat'
                        style={{marginBottom: 20}} 
                        value={contactDetails.work_suburb} 
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                work_suburb : text
                            })
                        }}
                    />
                    <TextInput 
                        label='State' 
                        mode='flat'
                        style={{marginBottom: 20}} 
                        value={contactDetails.work_state} 
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                work_state : text
                            })
                        }}
                    />
                    <TextInput 
                        label='Postcode' 
                        mode='flat'
                        style={{marginBottom: 20}} 
                        value={contactDetails.work_postcode} 
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                work_postcode : text
                            })
                        }}
                    />
                </View>
            }
            <Button 
                style={{
                    backgroundColor: theme.colors.primary,
                    ...GlobalStyles.floatingButtonBottom
                }} 
                mode='elevated' 
                textColor={theme.colors.background}
                onPress={() => screenFlowModule.onGoBack()}
            >
                Save
            </Button>
        </View>
    )
}

const EmergencyContactsEdit = (data : any) => {
    
    const theme = useTheme();
    const dataObj = data.data;
    const [emergencyContact, setEmergencyContact] = useState(dataObj);


    return (
        <View style={{paddingHorizontal: 20, flex: 1}}>
            <CustomText style={{marginBottom: 20}} variant='titleLargeBold'>Emergency Contacts Edit</CustomText>
            <TextInput 
                label='Name' 
                mode='flat'
                style={{marginBottom: 20}} 
                value={dataObj.name} 
                onChangeText={(text) => {
                    setEmergencyContact({
                        ...emergencyContact,
                        name : text
                    })
                }}
            />
            <TextInput 
                label='Relationship' 
                mode='flat'
                style={{marginBottom: 20}} 
                value={dataObj.relationship} 
                onChangeText={(text) => {
                    setEmergencyContact({
                        ...emergencyContact,
                        relationship : text
                    })
                }}
            />
            <TextInput 
                label='mobile' 
                mode='flat'
                style={{marginBottom: 20}} 
                value={dataObj.mobile} 
                onChangeText={(text) => {
                    setEmergencyContact({
                        ...emergencyContact,
                        mobile : text
                    })
                }}
            />
            <TextInput 
                label='Street' 
                mode='flat'
                style={{marginBottom: 20}} 
                value={dataObj.street} 
                onChangeText={(text) => {
                    setEmergencyContact({
                        ...emergencyContact,
                        street : text
                    })
                }}
            />
            <TextInput 
                label='Suburb' 
                mode='flat'
                style={{marginBottom: 20}} 
                value={dataObj.suburb} 
                onChangeText={(text) => {
                    setEmergencyContact({
                        ...emergencyContact,
                        suburb : text
                    })
                }}
            />
            <TextInput 
                label='State' 
                mode='flat'
                style={{marginBottom: 20}} 
                value={dataObj.state} 
                onChangeText={(text) => {
                    setEmergencyContact({
                        ...emergencyContact,
                        state : text
                    })
                }}
            />
            <TextInput 
                label='Postcode' 
                mode='flat'
                style={{marginBottom: 20}} 
                value={dataObj.postcode} 
                onChangeText={(text) => {
                    setEmergencyContact({
                        ...emergencyContact,
                        postcode : text
                    })
                }}
            />
            <Button 
                style={{
                    backgroundColor: theme.colors.primary,
                    ...GlobalStyles.floatingButtonBottom
                }} 
                mode='elevated' 
                textColor={theme.colors.background}
                onPress={() => screenFlowModule.onGoBack()}
            >
                Save
            </Button>
        </View>
    )
}

const EditScreen = ({route, navigation} : props) => {
    
    const EditPayload = route.params;

    let SelectedEditScreen;

    switch (EditPayload?.screenName) {
        case "MyDetails":
            SelectedEditScreen = <MyDetailsEdit data={EditPayload.data}/>;
            break;

        case "ContactDetails":
            SelectedEditScreen = <ContactDetailsEdit data={EditPayload.editData}/>
            break;

        case "EmergencyContacts":
            SelectedEditScreen = <EmergencyContactsEdit data={EditPayload.editData}/>   
            break;
    }

    return (
        <View style={GlobalStyles.page}>
            <View style={{alignItems: 'flex-end'}}>  
                <IconButton  icon={() => <LucideIcons.X/>} onPress={() => screenFlowModule.onGoBack()}/>
            </View>
            
            {SelectedEditScreen}
        </View>
    )
}

export default EditScreen;