import { useEffect, useRef } from 'react';
import { AppState, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as LucideIcons from 'lucide-react-native';
import { PlatformPressable } from '@react-navigation/elements';

import { Provider as PaperProvider, MD3LightTheme, Dialog, Portal, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useCustomFonts } from './helper/useCustomFonts';
import { AppStateStatus } from 'react-native';
import CustomText from './assets/CustomText';
import GlobalStyles from './style/GlobalStyles';

//screens
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import ContactsPage from './pages/Contacts';
import ProfilePage from './pages/Profile';
import EditScreen from './pages/EditScreen';
import ResourceStack from './pages/Resources/Resources';
import SkillsMaintenanceStack from './pages/SkillsMaintenance/SkillsMaintenance';
import SplashScreen from './pages/SplashScreen';

//navigation modules
import { createBottomTabNavigator, TransitionSpecs, SceneStyleInterpolators } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';

//theme
import lightThemeColors from './assets/themes/light.json';
import darkThemeColors from './assets/themes/dark.json';

//contexts
import { useAppContext } from './helper/AppContext';
import { useSecurityContext } from './helper/SecurityContext';
import { useDataContext } from './helper/DataContext';

//theme context
import { useThemeContext } from './assets/ThemeContext';

//types
import { RootStackParamList } from './types/AppTypes';

//helpers
import { authModule } from './helper/AuthModule';
import { screenFlowModule } from './helper/ScreenFlowModule';
import { dataHandlerModule } from './helper/DataHandlerModule';
import { DummyData } from './data/DummyData';
import { resourceDataHandlerModule } from './helper/ResourcesDataHandlerModule';

//set up custom themes
const customLightTheme = {
	...MD3LightTheme,
	colors: {
		...MD3LightTheme,
		...lightThemeColors.colors,
		darkText: "rgb(50, 50, 50)", //extending our theme with two extra colors for the text
		lightText: "rgb(86, 87, 89)" //extending our theme with two extra colors for the text
	}
}

const customDarkTheme = {
	...MD3LightTheme,
	colors: {
		...MD3LightTheme,
		...darkThemeColors.colors,
		darkText: "rgb(50, 50, 50)", //extending our theme with two extra colors for the text
		lightText: "rgb(86, 87, 89)" //extending our theme with two extra colors for the text
	}
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator = () => {

	const theme = useTheme();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				sceneStyle: GlobalStyles.AppBackground,
				headerShown: false,
				animation: 'fade',
				tabBarButton: (props) => (
					<PlatformPressable
						{...props}
						android_ripple={{ color: 'transparent' }}  // Disables the ripple effect for Android
					/>
				),
				tabBarLabel: ({ focused }) => {

					let formattedRouteName;

					switch (route.name){
						case 'HomeScreen':
							formattedRouteName = 'Home';
							break;
						case 'ContactsScreen':
							formattedRouteName = 'Contacts';
							break;
						case 'MyProfileScreen':
							formattedRouteName = 'Profile';
							break;
					}

					let iconColor = focused ? theme.colors.primary : theme.colors.outline;
					return <CustomText variant='labelSmall' style={{ color: iconColor }}>{formattedRouteName}</CustomText>
				},
				tabBarIcon: ({ focused, color, size }) => {

					let iconColor = focused ? theme.colors.primary : theme.colors.outline;

					switch (route.name) {
						case "HomeScreen":
							return <LucideIcons.House size={24} color={iconColor} />

						case "ContactsScreen":
							return <LucideIcons.NotebookTabs size={24} color={iconColor} />;

						case "MyProfileScreen":
							return <LucideIcons.CircleUser size={24} color={iconColor} />;
					}
				}
			})}
		>
			<Tab.Screen name="HomeScreen" component={HomePage}/>
			<Tab.Screen name="ContactsScreen" component={ContactsPage}/>
			<Tab.Screen name="MyProfileScreen" component={ProfilePage}/>
		</Tab.Navigator>
	)
}

export default function MainApp() {

	const navigatorRef = useNavigationContainerRef<RootStackParamList>();
	const { authType, setAuthType, isAuthenticating } = useSecurityContext();
	const { dialogActionFunction, dialogActionButtonText, showDialogCancelButton, showDialog, setShowDialog, showBusyIndicator, setShowBusyIndicator, dialogMessage, setDialogMessage, authenticationMode } = useAppContext();
	
	const dataContext = useDataContext();

	const lastAppState = useRef<AppStateStatus | null>(null)

	const onAppWake = async () => {

		//see if we have installation id saved
		const installationId = await AsyncStorage.getItem('installation_id');

		//no id, fresh install, create id and then log them with okta
		if (!installationId) {
			//create an installation id and save it to the device
			const newInstallationID = Crypto.randomUUID(); //create a new ID
			await AsyncStorage.setItem('installation_id', newInstallationID)

			if (authType !== 'okta') {
				setAuthType('okta')
			}

			if (screenFlowModule.getScreenState()?.name !== 'LoginScreen') {
				screenFlowModule.onNavigateToScreen('LoginScreen');
			}
		}
		else {
			//installation id present, need to move into local auth
			//check to see if the local hardware and biometrics is set up and enabled.
			if (await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync()) {

				const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
				//no biometrics or security set on phone - redirect to our pin
				if (securityLevel > 0) {
					const localAuthResult = await authModule.onLocalAuthLogin();

					if (localAuthResult) {
						//navigate to the home
						screenFlowModule.onNavigateToScreen('HomeScreen');
						return;
					}
				}
			}

			//if anything else, just give them the pin
			if (screenFlowModule.getScreenState()?.name !== 'LoginScreen') {
				screenFlowModule.onNavigateToScreen('LoginScreen');
			}

			setAuthType('pin');
		}
	}

	const onAppSleep = () => {
		//save the current time to last_active
		const currentTimeStamp = new Date().toISOString();
		AsyncStorage.setItem('last_active', currentTimeStamp);
	}

	const onGetInitialLoad = async () => {
		//set up the data handler module
		try {
			await dataHandlerModule.init();
			resourceDataHandlerModule.init();
		}
		catch (error) {
			setDialogMessage('An error occurred during data handler initialisation');
			setShowDialog(true);
			return;
		}

		const DummyObj = new DummyData();

		//get profile information
		const ServiceInfo = DummyObj.getServices();
		dataContext.setServices(ServiceInfo);
		

		const requests = [
			dataHandlerModule.batchGet('MembershipDetails', 'Z_VOL_MEMBER_SRV', 'MembershipDetails'),
			dataHandlerModule.batchGet('TrainingHistoryDetails', 'Z_VOL_MEMBER_SRV', 'TrainingHistoryDetails'),
			dataHandlerModule.batchGet('VolunteerRoles', 'Z_VOL_MEMBER_SRV', 'VolunteerRoles'),
			dataHandlerModule.batchGet('EmployeeDetails', 'Z_ESS_MSS_SRV', 'EmployeeDetails'),
			dataHandlerModule.batchGet('ObjectsOnLoan?$skip=0&$top=100&$filter=CurrentOnly%20eq%20true', 'Z_ESS_MSS_SRV', 'ObjectsOnLoan'),
			dataHandlerModule.batchGet('MedalsAwards?$skip=0&$top=100', 'Z_ESS_MSS_SRV', 'MedalsAwards'),
			dataHandlerModule.batchGet('AddressStates?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressStates'),
			dataHandlerModule.batchGet('AddressRelationships?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressRelationships'),
			dataHandlerModule.batchGet('Brigades', 'Z_VOL_MEMBER_SRV', 'Brigades'),
			dataHandlerModule.batchGet('Suburbs', 'Z_CFU_CONTACTS_SRV', 'Suburbs')
		]

		const results = await Promise.allSettled(requests);
		//if we have any fails - its a critical error
		const passed = results.every(x => x.status == 'fulfilled');

		if (!passed){
			//TODO take them to a critical error page
			setDialogMessage('Critical error occurred during the initial GET');
			setShowDialog(true);
			return;
		}

		//check to see if we have any read errors from server
		const readErrors = results.every(x => x.value.responseBody.error);
		if (readErrors){
			//TODO handle read errors somewhere
			setShowDialog(true);
			setDialogMessage('Read error on initialisation');
		}

		for (const x of results) {
			
			switch (x.value.entityName){
				case 'MembershipDetails':
					dataContext.setMembershipDetails(x.value.responseBody.d.results);
					break;
				
				case 'EmployeeDetails':
					dataContext.setEmployeeDetails(x.value.responseBody.d.results);
					break;

				case 'VolunteerDetails':
					dataContext.setVolunteerDetails(x.value.responseBody.d.results);
					break;

				case 'ObjectsOnLoan':
					dataContext.setObjectsOnLoan(x.value.responseBody.d.results);
					break;

				case 'TrainingHistoryDetails':
					dataContext.setTrainingHistoryDetails(x.value.responseBody.d.results);
					break;

				case 'MedalsAwards':
					dataContext.setMedalsAwards(x.value.responseBody.d.results);
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
						const myUnitContacts = await dataHandlerModule.batchGet(`Contacts?$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'Suburbs');
						dataContext.setMyUnitContacts(myUnitContacts.responseBody.d.results);
					}
					catch (error) {
						console.log(error)
					}
					break;

				case 'Suburbs':
					dataContext.setCfuPhonebookSuburbs(x.value.responseBody.d.results);
					break;
			}
		}
					

		screenFlowModule.onNavigateToScreen('HomeScreen');
	}

	useEffect(() => {

		onGetInitialLoad();

		if (authenticationMode == 'bypass') {
			return;
		}

		onAppWake();

		//subscriber for when the app goes into background / active
		const sub = AppState.addEventListener('change', async (nextAppState) => {

			if (nextAppState == 'background') {
				if (lastAppState.current == 'active') {
					onAppSleep();
				}
			}
			else if (nextAppState == 'active') {
				if (!authModule.isAuthenticating && lastAppState.current == 'background') {
					onAppWake();
				}
			}

			lastAppState.current = nextAppState;
		})

		return () => {
			sub.remove();
		}
	}, [])

	const { isLightMode } = useThemeContext();
	const { loaded, fonts } = useCustomFonts();

	const appTheme = isLightMode ? customLightTheme : customDarkTheme;

	if (!loaded) return null;

	return (
		<SafeAreaProvider>
			<SafeAreaView style={GlobalStyles.safeAreaView} edges={['top']}>
				<StatusBar hidden={false} />
				<PaperProvider theme={{ ...appTheme, fonts }}>
					<Portal>
						<Dialog
							visible={showDialog}
						>
							<Dialog.Content
								style={GlobalStyles.dialogContainer}
							>
								{
									showBusyIndicator && (
										<View>
											<ActivityIndicator style={{ marginTop: 20 }} animating={true} size='large'/>
											<CustomText style={{ marginTop: 50, marginBottom: 40 }} variant='bodyLarge'>Please wait...</CustomText>
										</View>
									)
								}
								{
									(dialogMessage !== '' && !showBusyIndicator) && (
										<CustomText style={{ marginTop: 50, marginBottom: 40 }} variant='bodyLarge'>{dialogMessage}</CustomText>
									)
								}
							</Dialog.Content>
							{
								!showBusyIndicator && (
									<Dialog.Actions>
										{
											showDialogCancelButton && (
												<Button
													onPress={() => {
														setShowDialog(false);
													}}>
													Cancel
												</Button>
											)
										}
										<Button
											onPress={() => {
												setShowDialog(false);
												dialogActionFunction?.();
											}}>
											{dialogActionButtonText}
										</Button>
									</Dialog.Actions>
								)
							}
						</Dialog>
					</Portal>
					<NavigationContainer
						ref={navigatorRef}
						onReady={() => {
							//initialise the Screen flow module
							screenFlowModule.onInitRootNavigator(navigatorRef)
						}}
					>
						<Stack.Navigator initialRouteName='SplashScreen' screenOptions={{ headerShown: false , cardStyle: GlobalStyles.AppBackground}}>
							<Stack.Screen name="SkillsMaintenance" component={SkillsMaintenanceStack}/>
							<Stack.Screen name='Resources' component={ResourceStack}/>
							<Stack.Screen name='SplashScreen' component={SplashScreen} />
							<Stack.Screen name='MainTabs' component={TabNavigator} />
							<Stack.Screen name='LoginScreen' component={LoginPage} />
							<Stack.Screen name='EditScreen' component={EditScreen} options={{presentation: 'modal'}}/>
						</Stack.Navigator>
					</NavigationContainer>
				</PaperProvider>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}
