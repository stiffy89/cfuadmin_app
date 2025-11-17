import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import { useAppContext } from '../helper/AppContext';
import { dataHandlerModule } from '../helper/DataHandlerModule';
import { useDataContext } from '../helper/DataContext';


import { authModule } from '../helper/AuthModule';
import { OktaLoginResult } from '../types/AppTypes';


const Users = () => {
	const appContext = useAppContext();
	const dataContext = useDataContext();

	const onGetInitialLoad = async () => {

		let user;

		try {
			const userInfo = await dataHandlerModule.batchGet('Users', 'Z_ESS_MSS_SRV', 'Users');
			if (userInfo.responseBody.error) {
				//TODO handle SAP error
				console.log('SAP Error')
				return;
			}
			else {
				dataContext.setCurrentUser(userInfo.responseBody.d.results);
				user = userInfo.responseBody.d.results[0]
			}
		}
		catch (error) {
			//TODO handle error
			console.log(error);
			return;
		}

		let zzplans = user.Zzplans;

		//member, team coordinator, vol admin
		if (!user.VolAdmin) {
			try {
				const brigadesResult = await dataHandlerModule.batchGet('Brigades', 'Z_VOL_MEMBER_SRV', 'Brigades');
				if (brigadesResult.responseBody.error) {
					throw new Error('SAP Error when calling brigades')
				}

				dataContext.setBrigadeSummary(brigadesResult.responseBody.d.results);
				dataContext.setMyOrgUnitDetails(brigadesResult.responseBody.d.results);
				zzplans = brigadesResult.responseBody.d.results[0].Zzplans;
			}
			catch (error) {
				//TODO handle the exception
				console.log(error)
				return;
			}
		}
		else {
			try {
				const brigadeSummaryResult = await dataHandlerModule.batchGet(`BrigadeSummaries?$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'Brigades');
				if (brigadeSummaryResult.responseBody.error) {
					throw new Error('SAP Error when calling brigade summaries')
				}

				dataContext.setBrigadeSummary(brigadeSummaryResult.responseBody.d.results);
				dataContext.setVolAdminLastSelectedOrgUnit(brigadeSummaryResult.responseBody.d.results);
			}
			catch (error) {
				//TODO handle the exception
				console.log(error);
				return;
			}
		}

		let requests = [
			dataHandlerModule.batchGet('MenuSet?$format=json', 'Z_MOB2_SRV', 'MenuSet', undefined, true),
			dataHandlerModule.batchGet('EmployeeDetails', 'Z_ESS_MSS_SRV', 'EmployeeDetails'),
			dataHandlerModule.batchGet('AddressStates?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressStates'),
			dataHandlerModule.batchGet('AddressRelationships?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressRelationships')
		]

		if (!user.VolAdmin) {
			requests.push(dataHandlerModule.batchGet('MembershipDetails', 'Z_VOL_MEMBER_SRV', 'MembershipDetails'));
			requests.push(dataHandlerModule.batchGet('VolunteerRoles', 'Z_VOL_MEMBER_SRV', 'VolunteerRoles'));
			requests.push(dataHandlerModule.batchGet(`Contacts?$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'Contacts'));
		}

		if (user.TeamCoordinator) {
			requests.push(dataHandlerModule.batchGet('Suburbs', 'Z_CFU_CONTACTS_SRV', 'Suburbs'));
			requests.push(dataHandlerModule.batchGet('RootOrgUnits', 'Z_VOL_MANAGER_SRV', 'RootOrgUnits'));
			requests.push(dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members'))
			requests.push(dataHandlerModule.batchGet(`MemberDrillCompletions?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'MemberDrillCompletions'))
			requests.push(dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails'))
		}
		else if (user.VolAdmin) {
			requests.push(dataHandlerModule.batchGet('CessationReasons', 'Z_VOL_MANAGER_SRV', 'VH_CessationReasons'));
			requests.push(dataHandlerModule.batchGet(`Contacts?$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20Mss%20eq%20true`, 'Z_VOL_MEMBER_SRV', 'Contacts'));
			requests.push(dataHandlerModule.batchGet('Suburbs', 'Z_CFU_CONTACTS_SRV', 'Suburbs'));
			requests.push(dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members'));
			requests.push(dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails'));
			requests.push(dataHandlerModule.batchGet(`MemberDrillCompletions?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'MemberDrillCompletions'));
		}

		const results = await Promise.allSettled(requests);

		//if we have any fails - its a critical error
		const passed = results.every(x => x.status == 'fulfilled');

		if (!passed) {
			//TODO take them to a critical error page
			appContext.setDialogMessage('Critical error occurred during the initial GET');
			appContext.setShowDialog(true);
			return;
		}

		//check to see if we have any read errors from server
		const readErrors = results.filter(x => x.value.responseBody.error);
		if (readErrors.length > 0) {
			//TODO handle read errors somewhere
			appContext.setShowDialog(true);
			appContext.setDialogMessage('Read error on initialisation');
		}

		for (const x of results) {
			switch (x.value.entityName) {
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

				case 'VH_CessationReasons':
					dataContext.setCessationReasons(x.value.responseBody.d.results);
					break;

				case 'VH_AddressStates':
					dataContext.setAddressStates(x.value.responseBody.d.results);
					break;

				case 'VH_AddressRelationships':
					dataContext.setAddressRelationships(x.value.responseBody.d.results);
					break;

				case 'Contacts':
					dataContext.setMyUnitContacts(x.value.responseBody.d.results);
					break;

				case 'Suburbs':
					dataContext.setCfuPhonebookSuburbs(x.value.responseBody.d.results);
					break;

				case 'Members':
					dataContext.setOrgUnitTeamMembers(x.value.responseBody.d.results);
					break;

				case 'DrillDetails':
					dataContext.setDrillDetails(x.value.responseBody.d.results);
					break;

				case 'MemberDrillCompletions':
					dataContext.setMemberDrillCompletion(x.value.responseBody.d.results);
					break;

				case 'RootOrgUnits':
					dataContext.setRootOrgUnits(x.value.responseBody.d.results);
					dataContext.setTrainingSelectedOrgUnit(x.value.responseBody.d.results[0]);
					break;
			}
		}

		screenFlowModule.onNavigateToScreen('HomeScreen');
	}

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{ marginBottom: 20 }}>Please select from the following users</Text>
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				disabled={true}
				onPress={async () => {
					dataHandlerModule.setAuthType('Basic');
					await AsyncStorage.removeItem('localAuthToken');
					const username = 'WOO823127';
					const password = 'BRIEFLY-receding-1!';
					const token = btoa(`${username}:${password}`);
					await AsyncStorage.setItem('localAuthToken', token)
					screenFlowModule.onNavigateToScreen('SplashScreen');
					onGetInitialLoad();
				}}
			>
				WOO823127
			</Button> 
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={async () => {
					dataHandlerModule.setAuthType('Basic');
					await AsyncStorage.removeItem('localAuthToken');
					const username = 'HOL825004';
					const password = 'BRIEFLY-receding-1!';
					const token = btoa(`${username}:${password}`);
					await AsyncStorage.setItem('localAuthToken', token)
					screenFlowModule.onNavigateToScreen('SplashScreen');
					onGetInitialLoad();
				}}
			>
				HOL825004
			</Button>
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={async () => {
					dataHandlerModule.setAuthType('Basic');
					await AsyncStorage.removeItem('localAuthToken');
					const username = 'WAK816316';
					const password = 'BRIEFLY-receding-1!';
					const token = btoa(`${username}:${password}`);
					await AsyncStorage.setItem('localAuthToken', token)
					screenFlowModule.onNavigateToScreen('SplashScreen');
					onGetInitialLoad();
				}}
			>
				WAK816316
			</Button>
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={async () => {
					dataHandlerModule.setAuthType('Basic');
					await AsyncStorage.removeItem('localAuthToken');
					const username = 'CAM823299';
					const password = 'BRIEFLY-receding-1!';
					const token = btoa(`${username}:${password}`);
					await AsyncStorage.setItem('localAuthToken', token)
					screenFlowModule.onNavigateToScreen('SplashScreen');
					onGetInitialLoad();
				}}
			>
				CAM823299
			</Button>
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={async () => {
					dataHandlerModule.setAuthType('Basic');
					await AsyncStorage.removeItem('localAuthToken');
					const username = 'BRO823198';
					const password = 'BRIEFLY-receding-1!';
					const token = btoa(`${username}:${password}`);
					await AsyncStorage.setItem('localAuthToken', token)
					screenFlowModule.onNavigateToScreen('SplashScreen');
					onGetInitialLoad();
				}}
			>
				BRO823198
			</Button>
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={async () => {
					dataHandlerModule.setAuthType('Basic');
					await AsyncStorage.removeItem('localAuthToken');
					const username = 'ZOL823006';
					const password = 'BRIEFLY-receding-1!';
					const token = btoa(`${username}:${password}`);
					await AsyncStorage.setItem('localAuthToken', token)
					screenFlowModule.onNavigateToScreen('SplashScreen');
					onGetInitialLoad();
				}}
			>
				ZOL823006
			</Button>
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={async () => {
					dataHandlerModule.setAuthType('Basic');
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
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={async () => {
					authModule.onOktaLogin()
						.then(async (result: OktaLoginResult) => {

							const oktaIDToken = result.response.idToken;

							if (oktaIDToken) {
								dataHandlerModule.setAuthType('Bearer');
								await AsyncStorage.removeItem('localAuthToken');
								const tokenResponse = await dataHandlerModule.getInitialTokens(oktaIDToken);
								const newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
								AsyncStorage.setItem('localAuthToken', newAccessToken);
								screenFlowModule.onNavigateToScreen('SplashScreen');
								onGetInitialLoad();
							}
							else {
								appContext.setDialogMessage('No okta ID token');
								appContext.setShowDialog(true);
							}

						})
						.catch((error) => {
							appContext.setDialogMessage('Okta ID token fetch error');
							appContext.setShowDialog(true);
						})
				}}
			>
				Okta Login Ernox
			</Button>
		</View>
	)
}

export default Users;