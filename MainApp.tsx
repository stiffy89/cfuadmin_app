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
import FormServiceStack from './pages/FormService/Forms';

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
				},
				tabBarStyle: {
					display: route.name === 'FormService' ? 'none' : 'flex',
				}
			})}
		>
			<Tab.Screen name="HomeScreen" component={HomePage}/>
			<Tab.Screen name="ContactsScreen" component={ContactsPage}/>
			<Tab.Screen name="MyProfileScreen" component={ProfilePage}/>
			<Tab.Screen name="Resources" component={ResourceStack}/>
			<Tab.Screen name="FormService" component={FormServiceStack}/>
		</Tab.Navigator>
	)
}

export default function MainApp() {

	const navigatorRef = useNavigationContainerRef<RootStackParamList>();
	const { authType, setAuthType, isAuthenticating } = useSecurityContext();
	const { showDialog, setShowDialog, showBusyIndicator, setShowBusyIndicator, dialogMessage, setDialogMessage, authenticationMode } = useAppContext();
	
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
		//get the information for the tiles

		//get profile information
		// - Z_VOL_MEMBER_SRV/MembershipDetails
		// - Z_VO_MEMBER_SRV/TrainingHistoryDetails
		// - Z_ESS_MSS_SRV/EmployeeDetails
		// - Z_VOL_MEMBER_SRV/VolunteerRoles
		// - Z_ESS_MSS_SRV/ObjectOnLoan?$skip=0&$top=100&$filter=CurrentOnly%20eq%20true
		// - Z_ESS_MSS_SRV/MedalsAwards?$skip=0&$top=100

	/*	const initialProfileData = [
			'Z_VOL_MEMBER_SRV/MembershipDetails',
			'Z_VO_MEMBER_SRV/TrainingHistoryDetails',
			'Z_ESS_MSS_SRV/EmployeeDetails',
			'Z_VOL_MEMBER_SRV/VolunteerRoles',
			'Z_ESS_MSS_SRV/ObjectOnLoan?$skip=0&$top=100&$filter=CurrentOnly%20eq%20true',
			'Z_ESS_MSS_SRV/MedalsAwards?$skip=0&$top=100'
		]. */

	/*	const results = await Promise.all([
			dataHandlerModule.readEntity('Z_VOL_MEMBER_SRV/MembershipDetails'),
      		dataHandlerModule.readEntity('Z_VO_MEMBER_SRV/TrainingHistoryDetails'),
      		dataHandlerModule.readEntity('Z_VOL_MEMBER_SRV/VolunteerRoles'),
			dataHandlerModule.readEntity('Z_ESS_MSS_SRV/EmployeeDetails'),
			dataHandlerModule.readEntity('Z_ESS_MSS_SRV/ObjectOnLoan?$skip=0&$top=100&$filter=CurrentOnly%20eq%20true'),
			dataHandlerModule.readEntity('Z_ESS_MSS_SRV/MedalsAwards?$skip=0&$top=100')
		]); */

	/*	const profileData = {
			"membershipDetails" : {}
		}

		try {
			const membershipDetails = await dataHandlerModule.readEntity('Z_VOL_MEMBER_SRV/MembershipDetails');
			profileData.membershipDetails = membershipDetails.data.d.results;
			
			const trainingHistoryDetails = await dataHandlerModule.readEntity('Z_VOL_MEMBER_SRV/TrainingHistoryDetails');

			const volRoles = await dataHandlerModule.readEntity('Z_VOL_MEMBER_SRV/VolunteerRoles');

			const empRoles = await dataHandlerModule.readEntity('Z_ESS_MSS_SRV/EmployeeDetails');

			const objOnLoan = await dataHandlerModule.readEntity('Z_ESS_MSS_SRV/ObjectsOnLoan?$skip=0&$top=100&$filter=CurrentOnly%20eq%20true');

			const medalsAndAwards = await dataHandlerModule.readEntity('Z_ESS_MSS_SRV/MedalsAwards?$skip=0&$top=100') 
		}
		catch (error){
			console.log(error);
			setDialogMessage('new error on loading initial data : ' + error);
			setShowDialog(true);
		}
*/

		//get profile information
		const ServiceInfo = DummyObj.getServices()
		const UserInfo = DummyObj.getUserInformation();
		const MyUnitContacts = DummyObj.getMyUnitContactList();
		const CfuPhonebookSuburbs = DummyObj.getCFUPhonebookSuburbsList();

		dataContext.setUser(UserInfo);
		dataContext.setServices(ServiceInfo);
		dataContext.setMyUnitContacts(MyUnitContacts);
		dataContext.setCfuPhonebookSuburbs(CfuPhonebookSuburbs)
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
										<Button
											onPress={() => {
												setShowDialog(false);
											}}>
											OK
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
						<Stack.Navigator initialRouteName='MainTabs' screenOptions={{ headerShown: false , cardStyle: GlobalStyles.AppBackground}}>
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
