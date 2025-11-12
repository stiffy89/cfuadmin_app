import {View, Text} from 'react-native';
import {Button} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import { useAppContext } from '../helper/AppContext';
import { dataHandlerModule } from '../helper/DataHandlerModule';
import { useDataContext } from '../helper/DataContext';

const Users = () => {
    const appContext = useAppContext();
    const dataContext = useDataContext();

    const onGetInitialLoad = async () => {

		let user;

		try {
			const userInfo = await dataHandlerModule.batchGet('Users','Z_ESS_MSS_SRV', 'Users');
			if (userInfo.responseBody.error){
				//TODO handle SAP error
				console.log('SAP Error')
				return;
			}
			else {
				dataContext.setCurrentUser(userInfo.responseBody.d.results);
				user = userInfo.responseBody.d.results[0]
			}
		}
		catch (error){
			//TODO handle error
			console.log(error);
			return;
		}

		let requests = [
			dataHandlerModule.batchGet('MenuSet?$format=json', 'Z_MOB2_SRV', 'MenuSet', undefined, true),
			dataHandlerModule.batchGet('EmployeeDetails', 'Z_ESS_MSS_SRV', 'EmployeeDetails'),
			dataHandlerModule.batchGet('AddressStates?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressStates'),
			dataHandlerModule.batchGet('AddressRelationships?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressRelationships')
		]

		if (!user.VolAdmin){
			requests.push(dataHandlerModule.batchGet('Brigades', 'Z_VOL_MEMBER_SRV', 'Brigades'));
			requests.push(dataHandlerModule.batchGet('MembershipDetails', 'Z_VOL_MEMBER_SRV', 'MembershipDetails'));
			requests.push(dataHandlerModule.batchGet('VolunteerRoles', 'Z_VOL_MEMBER_SRV', 'VolunteerRoles'));
		}
		else {
			const plans = user.Zzplans;
			requests.push(dataHandlerModule.batchGet(`BrigadeSummaries?$filter=Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MEMBER_SRV', 'Brigades'))
		}

		//add the extra calls for mymembers and training
		if (user.TeamCoordinator){
			requests = [...requests, 
				dataHandlerModule.batchGet('Suburbs', 'Z_CFU_CONTACTS_SRV', 'Suburbs'), 
				dataHandlerModule.batchGet('RootOrgUnits', 'Z_VOL_MANAGER_SRV', 'RootOrgUnits')
			]
		}
		else if (user.VolAdmin){
			const plans = user.Zzplans;

			requests = [
				...requests,
				dataHandlerModule.batchGet('Suburbs', 'Z_CFU_CONTACTS_SRV', 'Suburbs'), 
				dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members')
			]
		}
		
		const results = await Promise.allSettled(requests);
		console.log(results);

		//if we have any fails - its a critical error
		const passed = results.every(x => x.status == 'fulfilled');

		if (!passed){
			//TODO take them to a critical error page
			appContext.setDialogMessage('Critical error occurred during the initial GET');
			appContext.setShowDialog(true);
			return;
		}

		//check to see if we have any read errors from server
		const readErrors = results.filter(x => x.value.responseBody.error);
		if (readErrors.length > 0){
			//TODO handle read errors somewhere
			appContext.setShowDialog(true);
			appContext.setDialogMessage('Read error on initialisation');
		}

		for (const x of results) {
			switch (x.value.entityName){
				case 'MenuSet':
					dataContext.setServices(x.value.responseBody.d.results);
					break;

				case 'Users':
					dataContext.setCurrentUser(x.value.responseBody.d.results);
					break;

				case 'EmployeeDetails':
					dataContext.setEmployeeDetails(x.value.responseBody.d.results);
					break;

				case 'MembershipDetails':
					dataContext.setMembershipDetails(x.value.responseBody.d.results);
					break;

				case 'VolunteerRoles':
					dataContext.setVolunteerRoles(x.value.responseBody.d.results);
					break;

				case 'VH_AddressStates':
					dataContext.setAddressStates(x.value.responseBody.d.results);
					break;

				case 'VH_AddressRelationships':
					dataContext.setAddressRelationships(x.value.responseBody.d.results);
					break;

				case 'Brigades':
					dataContext.setBrigadeSummary(x.value.responseBody.d.results);
					const zzplans = x.value.responseBody.d.results[0].Zzplans;

					try {

						let sContactsUrlString = `Contacts?$filter=Zzplans%20eq%20%27${zzplans}%27`;

						if (user.VolAdmin){
							sContactsUrlString = `Contacts?$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20Mss%20eq%20true`;
						}

						const myUnitContacts = await dataHandlerModule.batchGet(sContactsUrlString, 'Z_VOL_MEMBER_SRV', 'Contacts');

						if (myUnitContacts.responseBody.error){
							//TODO handle error
							throw new Error('my Unit contacts read error');
						}

						dataContext.setMyUnitContacts(myUnitContacts.responseBody.d.results);
					}
					catch (error) {
						//TODO handle error
						console.log(error)
					}
					break;

				case 'Suburbs':
					dataContext.setCfuPhonebookSuburbs(x.value.responseBody.d.results);
					break;

				case 'RootOrgUnits':
					dataContext.setRootOrgUnits(x.value.responseBody.d.results);
					dataContext.setTrainingSelectedOrgUnit(x.value.responseBody.d.results[0]);

					if (x.value.responseBody.d.results.length > 0){
						const firstRootOrgUnit = x.value.responseBody.d.results[0];
						const plans = firstRootOrgUnit.Plans;
						try {
							const orgUnitTeamMembers = await dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members');
							const memberDrillDownCompletion = await dataHandlerModule.batchGet(`MemberDrillCompletions?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MANAGER_SRV', 'MemberDrillCompletions');
							const drillDetails = await dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails');

							dataContext.setOrgUnitTeamMembers(orgUnitTeamMembers.responseBody.d.results);
							dataContext.setMemberDrillCompletion(memberDrillDownCompletion.responseBody.d.results);
							dataContext.setDrillDetails(drillDetails.responseBody.d.results)
						}
						catch (error) {
							//TODO handle error
							console.log(error)
						}
					}
					break;
			}
		}
					
		screenFlowModule.onNavigateToScreen('HomeScreen');
	}

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{marginBottom: 20}}>Please select from the following users</Text>
            <Button 
                style={{marginBottom: 20}} 
                mode='outlined'
                onPress={async () => {
                    await AsyncStorage.removeItem('localAuthToken');
                    const username = 'HOL825004';
                    const password = 'Wary-hess-CARE-1!';
                    const token = btoa(`${username}:${password}`);
                    await AsyncStorage.setItem('localAuthToken', token)
                    screenFlowModule.onNavigateToScreen('SplashScreen');
                    onGetInitialLoad();
                }}
            >
                Team Member - HOL825004
            </Button>
            <Button 
                style={{marginBottom: 20}} 
                mode='outlined'
                onPress={async () => {
                    await AsyncStorage.removeItem('localAuthToken');
                    const username = 'WAK816316';
                    const password = 'Wary-hess-CARE-1!';
                    const token = btoa(`${username}:${password}`);
                    await AsyncStorage.setItem('localAuthToken', token)
                    screenFlowModule.onNavigateToScreen('SplashScreen');
                    onGetInitialLoad();
                }}
            >
                Team Coordinator - WAK816316
            </Button>
            <Button 
                style={{marginBottom: 20}} 
                mode='outlined'
                onPress={async () => {
                    await AsyncStorage.removeItem('localAuthToken');
                    const username = 'CAM823299';
                    const password = 'Wary-hess-CARE-1!';
                    const token = btoa(`${username}:${password}`);
                    await AsyncStorage.setItem('localAuthToken', token)
                    screenFlowModule.onNavigateToScreen('SplashScreen');
                    onGetInitialLoad();
                }}
            >
                Secondary contact - CAM823299
            </Button>
			<Button 
                style={{marginBottom: 20}} 
                mode='outlined'
                onPress={async () => {
                    await AsyncStorage.removeItem('localAuthToken');
                    const username = 'BRO823198';
                    const password = 'Wary-hess-CARE-1!';
                    const token = btoa(`${username}:${password}`);
                    await AsyncStorage.setItem('localAuthToken', token)
                    screenFlowModule.onNavigateToScreen('SplashScreen');
                    onGetInitialLoad();
                }}
            >
                Member of 10 units - BRO823198
            </Button>
			<Button 
                style={{marginBottom: 20}} 
                mode='outlined'
                onPress={async () => {
                    await AsyncStorage.removeItem('localAuthToken');
                    const username = 'CUR822107';
                    const password = 'Wary-hess-CARE-1!';
                    const token = btoa(`${username}:${password}`);
                    await AsyncStorage.setItem('localAuthToken', token)
                    screenFlowModule.onNavigateToScreen('SplashScreen');
                    onGetInitialLoad();
                }}
            >
                Multi-unit but TC for only 1 unit - CUR822107
            </Button>
			<Button 
                style={{marginBottom: 20}} 
                mode='outlined'
				disabled={true}
                onPress={async () => {
                    await AsyncStorage.removeItem('localAuthToken');
                    const username = 'HOB7804';
                    const password = 'Wary-hess-CARE-1!';
                    const token = btoa(`${username}:${password}`);
                    await AsyncStorage.setItem('localAuthToken', token)
                    screenFlowModule.onNavigateToScreen('SplashScreen');
                    onGetInitialLoad();
                }}
            >
                Vol Admin - HOB7804
            </Button>
        </View>
    )
}

export default Users;