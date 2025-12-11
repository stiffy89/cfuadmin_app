import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTheme, IconButton, TextInput, List } from 'react-native-paper';
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import GenericFormatter from '../helper/GenericFormatters';
import { useDataContext } from '../helper/DataContext';
import GenericAppHelpers from '../helper/GenericAppHelpers';

type props = StackScreenProps<RootStackParamList, 'MembershipDetailsScreen'>; //typing the navigation props

const MembershipDetails = ({ route, navigation }: props) => {

    const theme = useTheme();
    const params: any = route.params ?? {};
    const genericFormatter = new GenericFormatter();
    const dataContext = useDataContext();

    const objectsOnLoan = dataContext.objectsOnLoan;
    const medalsAndAwards = dataContext.medalsAwards;
    const genericHelper = new GenericAppHelpers();

    let membershipInfo;

    if (dataContext.currentProfile == 'MyMembers') {
        membershipInfo = dataContext.myMembersMembershipDetails[0];
    } else {
        membershipInfo = dataContext.membershipDetails[0];
    }

    const [membershipDetails, setMembershipDetails] = useState(membershipInfo)

    useEffect(() => {
        //we only want this to update IF we are going in from my members and not from profile
        if (dataContext.currentProfile == 'MyMembers') {
            setMembershipDetails(dataContext.myMembersMembershipDetails[0])
        }
    }, [dataContext.myMembersMembershipDetails])

    const EditData = (data: any) => {
        screenFlowModule.onNavigateToScreen("EditScreen", {
            screenName: "VolunteerData",
            editData: data,
        });
    };

    return (
        <ScrollView>
            <View style={{ ...GlobalStyles.page, paddingBottom: 40 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <IconButton icon={() => <ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                    <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>Membership Details</CustomText>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <CustomText variant='bodyLargeBold'>Volunteer Data</CustomText>

                        {(dataContext.currentUser[0].TeamCoordinator || dataContext.currentUser[0].VolAdmin) && //only voladm and team coordinators get editing access to membership data
                            <Pencil
                                style={{ marginRight: 10 }}
                                color={theme.colors.primary}
                                size={20}
                                onPress={() => EditData(membershipDetails)}
                            />
                        }
                    </View>

                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Unit' value={membershipDetails.Otext} />
                    <View>
                        <TextInput
                            style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                            editable={false}
                            mode='flat'
                            underlineColor='transparent'
                            label='Location'
                            value={membershipDetails.Stext}
                            textColor={theme.colors.secondary}
                        />
                        <Pressable
                            onPress={() => {
                                if (membershipDetails.Stext){
                                    genericHelper.navigateToNativeMaps(membershipDetails.Stext);
                                }
                            }}
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: 20,
                                height: 60,
                                zIndex: 10
                            }}
                        />
                    </View>
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Start Date' value={genericFormatter.formatFromEdmDate(membershipDetails.StartDate)} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Member Since' value={genericFormatter.formatFromEdmDate(membershipDetails.FromDate)} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Service' value={membershipDetails.LengthServiceYears} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Member type' value={membershipDetails.ZzmemtyDesc} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Status' value={membershipDetails.ZzstatuDesc} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Volunteer Status' value={membershipDetails.ZzvstatDesc} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Occupation' value={membershipDetails.Zzoccupation} />
                    <CustomText style={{ marginVertical: 20 }} variant='bodyLargeBold'>Uniform Issued</CustomText>
                    <List.Section style={{ backgroundColor: '#f9f9f9ff', ...GlobalStyles.globalBorderRadius }}>
                        <List.Subheader style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: theme.colors.surfaceDisabled }}><CustomText variant='bodyMediumBold'>Uniform Details</CustomText></List.Subheader>
                        {
                            objectsOnLoan.map((item: any, i: number) => {
                                return (
                                    <List.Item
                                        key={i}
                                        style={{ height: 80, justifyContent: 'center' }}
                                        onPress={() => { screenFlowModule.onNavigateToScreen('UniformDetailsScreen', item) }}
                                        title={`${item.ObjectTypesStext} - ${item.Anzkl} ${item.UnitsEtext}`}
                                        right={() => <ChevronRight color={theme.colors.primary} />}
                                    />
                                )
                            })
                        }
                    </List.Section>
                    <CustomText style={{ marginVertical: 20 }} variant='bodyLargeBold'>Medals and Awards</CustomText>
                    <List.Section style={{ backgroundColor: '#f9f9f9ff', ...GlobalStyles.globalBorderRadius }}>
                        <List.Subheader style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: theme.colors.surfaceDisabled }}><CustomText variant='bodyMediumBold'>Medals and Awards Details</CustomText></List.Subheader>
                        {
                            medalsAndAwards.map((item: any, i: number) => {
                                return (
                                    <List.Item
                                        key={i}
                                        style={{ height: 80, justifyContent: 'center' }}
                                        onPress={() => { screenFlowModule.onNavigateToScreen('MedalsAndAwardsScreen', item) }}
                                        titleNumberOfLines={2}
                                        title={item.Awdtx}
                                        right={() => <ChevronRight color={theme.colors.primary} />}
                                    />
                                )
                            })
                        }
                    </List.Section>
                </View>
            </View>
        </ScrollView>
    )
}

export default MembershipDetails;