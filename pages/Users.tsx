import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenFlowModule, screenFlowModule } from '../helper/ScreenFlowModule';
import { useAppContext } from '../helper/AppContext';
import { dataHandlerModule } from '../helper/DataHandlerModule';
import { useDataContext } from '../helper/DataContext';
import { useHelperValuesDataContext } from '../helper/HelperValuesDataContext';


import { authModule } from '../helper/AuthModule';
import { OktaLoginResult } from '../types/AppTypes';


const Users = () => {
	const appContext = useAppContext();
	const dataContext = useDataContext();
	const helperDataContext = useHelperValuesDataContext();

	const onGetInitialLoad = async () => {

		let user;

		try {
			const userInfo = await dataHandlerModule.batchGet('Users', 'Z_ESS_MSS_SRV', 'Users');
			dataContext.setCurrentUser(userInfo.responseBody.d.results);
			user = userInfo.responseBody.d.results[0]
		}
		catch (error) {
			appContext.setShowDialog(false);
			screenFlowModule.onNavigateToScreen('ErrorPage', error);
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
				appContext.setShowDialog(false);
				screenFlowModule.onNavigateToScreen('ErrorPage', error);
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
				appContext.setShowDialog(false);
				screenFlowModule.onNavigateToScreen('ErrorPage', error);
				return;
			}
		}

		//set the plans for the contact printing
		dataContext.setContactsPrintPlans(zzplans);

		let requests = [
			dataHandlerModule.batchGet('MenuSet?$format=json', 'Z_MOB2_SRV', 'MenuSet', undefined, true),
			dataHandlerModule.batchGet('EmployeeDetails', 'Z_ESS_MSS_SRV', 'EmployeeDetails'),
			dataHandlerModule.batchGet('AddressStates?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressStates'),
			dataHandlerModule.batchGet('AddressRelationships?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressRelationships'),
			dataHandlerModule.batchGet('EquityGenderValues', 'Z_ESS_MSS_SRV', 'VH_EquityGenderValues'),
			dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2708%27', 'Z_ESS_MSS_SRV', 'VH_EquityAboriginalValues'),
			dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2709%27', 'Z_ESS_MSS_SRV', 'VH_EquityRacialEthnicReligiousValues'),
			dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2702%27', 'Z_ESS_MSS_SRV', 'VH_EquityFirstLanguageValues'),
			dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2703%27', 'Z_ESS_MSS_SRV', 'VH_EquityNESLValues'),
			dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2701%27', 'Z_ESS_MSS_SRV', 'VH_EquityDisabilityValues')
		]

		if (!user.VolAdmin) {
			requests.push(dataHandlerModule.batchGet('MembershipDetails', 'Z_VOL_MEMBER_SRV', 'MembershipDetails'));
			requests.push(dataHandlerModule.batchGet('VolunteerRoles', 'Z_VOL_MEMBER_SRV', 'VolunteerRoles'));
			requests.push(dataHandlerModule.batchGet(`Contacts?$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'Contacts'));
		}

		if (user.TeamCoordinator) {
			requests.push(dataHandlerModule.batchGet('Suburbs', 'Z_CFU_CONTACTS_SRV', 'Suburbs'));
			requests.push(dataHandlerModule.batchGet('RootOrgUnits', 'Z_VOL_MANAGER_SRV', 'RootOrgUnits'));
			requests.push(dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members'));
			requests.push(dataHandlerModule.batchGet(`MemberDrillCompletions?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'MemberDrillCompletions'));
			requests.push(dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails'));
			requests.push(dataHandlerModule.batchGet(`PositionHistoryFilters?$skip=0&$top=100`, 'Z_VOL_MANAGER_SRV', 'VH_PositionHistory'));
		}
		else if (user.VolAdmin) {
			requests.push(dataHandlerModule.batchGet('CessationReasons', 'Z_VOL_MANAGER_SRV', 'VH_CessationReasons'));
			requests.push(dataHandlerModule.batchGet(`Contacts?$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20Mss%20eq%20true`, 'Z_VOL_MEMBER_SRV', 'Contacts'));
			requests.push(dataHandlerModule.batchGet('Suburbs', 'Z_CFU_CONTACTS_SRV', 'Suburbs'));
			requests.push(dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members'));
			requests.push(dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails'));
			requests.push(dataHandlerModule.batchGet(`MemberDrillCompletions?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'MemberDrillCompletions'));
			requests.push(dataHandlerModule.batchGet('MembershipTypes?$skip=0&$top=100', 'Z_VOL_MEMBER_SRV', 'VH_MembershipTypes'));
			requests.push(dataHandlerModule.batchGet('MembershipStatuses?$skip=0&$top=100', 'Z_VOL_MEMBER_SRV', 'VH_MembershipStatuses'));
			requests.push(dataHandlerModule.batchGet('VolunteerStatuses?$skip=0&$top=100', 'Z_VOL_MEMBER_SRV', 'VH_VolunteerStatuses'));
			requests.push(dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails'));
			requests.push(dataHandlerModule.batchGet(`PositionHistoryFilters?$skip=0&$top=100`, 'Z_VOL_MANAGER_SRV', 'VH_PositionHistory'));
		}

		const results = await Promise.allSettled(requests);

		//if we have any fails - its a critical error
		const passed = results.every(x => x.status == 'fulfilled');

		if (!passed) {
			appContext.setShowDialog(false);
			screenFlowModule.onNavigateToScreen('ErrorPage', {
				isAxiosError: false,
				message : "Hang on, we found an error. There was a problem in getting your initial data. Please go back and try again or contact your IT administrator for further assistance."
			});
			return;
		}

		//check to see if we have any read errors from server
		const readErrors = results.filter(x => x.value.responseBody.error);
		if (readErrors.length > 0) {
			appContext.setShowDialog(false);
			screenFlowModule.onNavigateToScreen('ErrorPage', {
				isAxiosError: false,
				message : "Hang on, we found an error. There was a problem in getting your initial data. Please go back and try again or contact your IT administrator for further assistance."
			});
			return;
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

				case 'VH_PositionHistory':
					helperDataContext.setPositionHistoryHelperValue(x.value.responseBody.d.results);
					break;

				case 'VH_CessationReasons':
					helperDataContext.setCessationReasons(x.value.responseBody.d.results);
					break;

				case 'VH_AddressStates':
					helperDataContext.setAddressStates(x.value.responseBody.d.results);
					break;

				case 'VH_AddressRelationships':
					helperDataContext.setAddressRelationships(x.value.responseBody.d.results);
					break;

				case 'VH_MembershipTypes':
					helperDataContext.setMembershipTypes(x.value.responseBody.d.results);
					break;

				case 'VH_MembershipStatuses':
					helperDataContext.setMembershipStatuses(x.value.responseBody.d.results);
					break;

				case 'VH_VolunteerStatuses':
					helperDataContext.setVolunteerStatuses(x.value.responseBody.d.results);
					break;

				case 'VH_EquityAboriginalValues':
					helperDataContext.setEquityAboriginalValues(x.value.responseBody.d.results);
					break;

				case 'VH_EquityRacialEthnicReligiousValues':
					helperDataContext.setEquityRacialEthnicReligiousValues(x.value.responseBody.d.results);
					break;

				case 'VH_EquityFirstLanguageValues':
					helperDataContext.setEquityFirstLanguageValues(x.value.responseBody.d.results);
					break;

				case 'VH_EquityNESLValues':
					helperDataContext.setEquityNESLValues(x.value.responseBody.d.results);
					break;

				case 'VH_EquityDisabilityValues':
					helperDataContext.setEquityDisabilityValues(x.value.responseBody.d.results);
					break;

				case 'VH_EquityGenderValues':
					helperDataContext.setEquityGenderValues(x.value.responseBody.d.results);
					break;
			}
		}

		screenFlowModule.onNavigateToScreen('HomeScreen');
	}

	let presses = 0;
	let lastTimePressed : any = null;

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{ marginBottom: 20 }}>Please select from the following users</Text>
		{/*	<Button
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
			</Button> */}
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
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={async () => {
					authModule.onFRNSWLogin()
						.then(async (result: OktaLoginResult) => {
							const oktaIDToken = result.response.idToken;

							if (oktaIDToken) {
								dataHandlerModule.setAuthType('Bearer');
								await AsyncStorage.removeItem('localAuthToken');
								await AsyncStorage.removeItem('localRefreshToken');

								const tokenResponse = await dataHandlerModule.getFRNSWInitialTokens(oktaIDToken);

								const newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
								const newRefreshToken = tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;

								await AsyncStorage.setItem('localAuthToken', newAccessToken);
								await AsyncStorage.setItem('localRefreshToken', newRefreshToken);
								
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
				FRNSW Login
			</Button>
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={async () => {
					const refreshToken = await AsyncStorage.getItem('localRefreshToken');

					if (refreshToken){
						const refreshedAccessToken = await dataHandlerModule.getRefreshedAccessToken(refreshToken);
						console.log(refreshedAccessToken);
					}
					else {
						console.log('no refresh token saved')
					}
					
				}}
			>
				FRNSW Refresh Token
			</Button>
			<Button
				style={{ marginBottom: 20 }}
				mode='outlined'
				onPress={() => {
					if (lastTimePressed && (Date.now() - lastTimePressed <= 2000)) {
						presses += 1;
					} else {
						presses = 1;
					}

					lastTimePressed = Date.now();

					if (presses == 10){
						screenFlowModule.onNavigateToScreen('ExternalLoginPage');
					} 
				}}
			>
				External Login
			</Button>
		</View>
	)
}

export default Users;