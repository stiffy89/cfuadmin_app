import { useEffect, useRef } from 'react';
import { AppState, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as LucideIcons from 'lucide-react-native';
import { PlatformPressable } from '@react-navigation/elements';

import { Provider as PaperProvider, MD3LightTheme, Dialog, Portal, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useCustomFonts } from './helper/useCustomFonts';
import { AppStateStatus } from 'react-native';
import CustomText from './assets/CustomText';
import GlobalStyles from './style/GlobalStyles';
import  * as SecureStore from 'expo-secure-store';

//screens
import LoginPage from './pages/Login';
import LocalAuth from './pages/LocalAuth';
import HomePage from './pages/Home';
import ContactsPage from './pages/Contacts';
import ProfilePage from './pages/Profile';
import EditScreen from './pages/EditScreen';
import ResourceStack from './pages/Resources/Resources';
import FormServiceStack from './pages/FormService/Forms';
import SkillsMaintenanceStack from './pages/SkillsMaintenance/SkillsMaintenance';
import SplashScreen from './pages/SplashScreen';
import MyMembers from './pages/MyMembers';
import MyMembersProfile from './pages/MyMembersProfile';
import MyDetails from './pages/MyDetails';
import ContactDetails from './pages/ContactDetails';
import EmergencyContacts from './pages/EmergencyContacts';
import MembershipDetails from './pages/MembershipDetails';
import TrainingHistory from './pages/TrainingHistory';
import TrainingDetails from './pages/TrainingDetails';
import MyUnit from './pages/MyUnit';
import UniformDetails from './pages/UniformDetails';
import MedalsAndAwards from './pages/MedalsAndAwards';
import CardModal from './assets/CardModal';
import TrainingMain from './pages/Training/TrainingMain';
import TrainingCompletionByDrill from './pages/Training/TrainingCompletionByDrill';
import TrainingCompletionByUser from './pages/Training/TrainingCompletionByUser';
import FeedbackScreen from './pages/FeedbackScreen';
import PDFDisplayPage from './pages/PDFDisplayPage';
import VolAdminSearch from './pages/VolAdminSearch';
import VolAdminCeaseMember from './pages/VolAdminCeaseMember';
import AllServicesListScreen from './pages/AllServicesListScreen';
import VolunteerNotes from './pages/VolunteerNotes';
import PositionHistory from './pages/PositionHistory';
import EquityDiversity from './pages/EquityDiversity';
import ErrorPage from './pages/ErrorPage';
import ExternalLoginPage from './pages/ExternalTesters/ExternalLoginPage';
import ExternalHomePage from './pages/ExternalTesters/ExternalHomePage';

//navigation modules
import { createBottomTabNavigator, TransitionSpecs, SceneStyleInterpolators } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';

//theme
import lightThemeColors from './assets/themes/light.json';

//contexts
import { useAppContext } from './helper/AppContext';
import { useSecurityContext } from './helper/SecurityContext';
import { useDataContext } from './helper/DataContext';

//types
import { RootStackParamList } from './types/AppTypes';

//helpers
import { authModule } from './helper/AuthModule';
import { screenFlowModule } from './helper/ScreenFlowModule';
import { dataHandlerModule } from './helper/DataHandlerModule';
import { isAxiosError } from 'axios';


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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator = () => {

	const theme = useTheme();
	const dataContext = useDataContext();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				lazy: false,
				sceneStyle: GlobalStyles.AppBackground,
				headerShown: false,
			//	animation: 'fade',
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
							formattedRouteName = 'My Profile';
							break;
					}

					let iconColor = focused ? theme.colors.primary : "#000";
					return <CustomText variant='labelSmall' style={{ color: iconColor }}>{formattedRouteName}</CustomText>
				},
				tabBarIcon: ({ focused, color, size }) => {
					let iconColor = focused ? theme.colors.primary : "#000";

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
			{
				(!dataContext.currentUser[0].VolAdmin) && (
					<Tab.Screen 
						name="MyProfileScreen" 
						component={ProfilePage} 
						listeners={({ navigation, route }) => ({
							tabPress: (e) => {
								dataContext.setCurrentProfile('CurrentUser')
							}
						})}
					/>
				)
			}
		</Tab.Navigator>
	)
}

export default function MainApp() {

	const navigatorRef = useNavigationContainerRef<RootStackParamList>();
	const { dialogActionFunction, dialogActionButtonText, showDialogCancelButton, showDialog, setShowDialog, showBusyIndicator, setShowBusyIndicator, dialogMessage, setDialogMessage, cardModalVisible, setCardModalVisible } = useAppContext();
	
	const dataContext = useDataContext();

	const lastAppState = useRef<AppStateStatus | null>(null)

	const onAppWake = async () => {

		//see if we have installation id saved
		const installationId = await AsyncStorage.getItem('installation-id');

		//no id, fresh install, create id and then log them with okta
		if (!installationId) {
			//create an installation id and save it to the device
			const newInstallationID = Crypto.randomUUID(); //create a new ID
			await AsyncStorage.setItem('installation-id', newInstallationID)
			screenFlowModule.onNavigateToScreen('LoginScreen');
		}
		else {
			//if they have an installation id - check to see if they have pin stored (they couldve checked out mid way through the first login process)
			const pin = await SecureStore.getItemAsync('pin');
			if (!pin) {
				screenFlowModule.onNavigateToScreen('LoginScreen');
			}
			else {
				//check to see if 15 minutes has passed, if it hasnt, then just let them back in. If 15 has passed, they must sign back in using local auth.
				const lastActiveStr = await AsyncStorage.getItem('last-active');
				
				if (lastActiveStr) {
					const lastActiveNum = Number(lastActiveStr);
					const now = Date.now();
					const minutesElapsed = (now - lastActiveNum) / 1000 / 60;

					console.log('minutes passed : ', minutesElapsed);
					
					//1 or under, let them through
					if (minutesElapsed <= 1){
						return;
					}
				}

				screenFlowModule.onNavigateToScreen('LocalAuthScreen');
			}
		}
	}

	const onAppSleep = async () => {
		//save the current time to last_active
		const now = Date.now();
		console.log(now);
		await AsyncStorage.setItem('last-active', String(now));
	}

	const onAppInitLoad = async () => {
		//set up the data handler module
		try {
			await dataHandlerModule.init();
		}
		catch {

			const error = {
				isAxiosError : false,
				message : 'An error occurred during data handler initialisation'
			}

			screenFlowModule.onNavigateToScreen('ErrorPage', error);
		}
	}
	
	//this initializes the app wake and app sleep states
	const cleanupRef = useRef<any | null>(null)
	const onInitialiseAppState = () => {
		//subscriber for when the app goes into background / active
		const sub = AppState.addEventListener('change', async (nextAppState) => {
		//	console.log('current app state : ', nextAppState);
		//	console.log('auth module state : ', authModule.isAuthenticating);

			if (nextAppState == 'background') {
				if ((lastAppState.current == 'active') || (lastAppState.current == null)) {
					onAppSleep();
				}
				lastAppState.current = nextAppState;
			}
			else if (nextAppState == 'active') {
				if (!authModule.isAuthenticating && lastAppState.current == 'background') {
					onAppWake();
				}
				lastAppState.current = nextAppState;
			}
			
		})

		cleanupRef.current = () => sub.remove();
	}

	useEffect(() => {

		//every time the app wakes from being backgrounded, we run this block
		const appAwakeLogic = async () => {
			onAppInitLoad();
			const installationId = await AsyncStorage.getItem('installation-id');
			if (!installationId){
				return;
			}
			onAppWake();
		}

		appAwakeLogic();

		return () => {
			cleanupRef.current?.();
		}
	}, [])

	const { loaded, fonts } = useCustomFonts();

	const appTheme = customLightTheme;

	if (!loaded) return null;

	return (
		<SafeAreaProvider>
			<SafeAreaView style={GlobalStyles.safeAreaView} edges={['top']}>
				<StatusBar hidden={false} />
				<PaperProvider theme={{ ...appTheme, fonts }}>
					<Portal>
						<CardModal visible={cardModalVisible} setVisible={setCardModalVisible}/>
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
						onReady={async () => {
							//initialise the Screen flow module
							screenFlowModule.onInitRootNavigator(navigatorRef);
		
							//check to see if we have an installation id - if we don't - then take them to the set up page
							const installationId = await AsyncStorage.getItem('installation-id');
							if (!installationId){
								onInitialiseAppState();
								onAppWake();
							}
							else if (cleanupRef.current == null){
								onInitialiseAppState();
								onAppWake();
							}
						}}
					>
						<Stack.Navigator screenOptions={{ headerShown: false , cardStyle: GlobalStyles.AppBackground}}>
							<Stack.Screen name='LoginScreen' component={LoginPage} />
							<Stack.Screen name='SplashScreen' component={SplashScreen} />
							<Stack.Screen name='LocalAuthScreen' component={LocalAuth}/>
							<Stack.Screen name='MyMembers' component={MyMembers}/>
							<Stack.Screen name='MyMembersProfile' component={MyMembersProfile}/>
							<Stack.Screen name='Resources' component={ResourceStack}/>
							<Stack.Screen name='FormService' component={FormServiceStack}/>
							<Stack.Screen name="SkillsMaintenance" component={SkillsMaintenanceStack}/>
							<Stack.Screen name='MainTabs' component={TabNavigator} />
							<Stack.Screen name='MyDetailsScreen' component={MyDetails}/>
							<Stack.Screen name='ContactDetailsScreen' component={ContactDetails}/>
							<Stack.Screen name='EmergencyContactsScreen' component={EmergencyContacts} />
							<Stack.Screen name='MyUnitDetailsScreen' component={MyUnit} />
							<Stack.Screen name='TrainingHistoryScreen' component={TrainingHistory} />
							<Stack.Screen name='TrainingDetailsScreen' component={TrainingDetails}/>
							<Stack.Screen name='MembershipDetailsScreen' component={MembershipDetails}/>
							<Stack.Screen name='UniformDetailsScreen' component={UniformDetails}/>
							<Stack.Screen name='MedalsAndAwardsScreen' component={MedalsAndAwards}/>
							<Stack.Screen name='EditScreen' component={EditScreen}/>
							<Stack.Screen name='TrainingMain' component={TrainingMain}/>
							<Stack.Screen name='TrainingCompletionByDrill' component={TrainingCompletionByDrill}/>
							<Stack.Screen name='TrainingCompletionByUser' component={TrainingCompletionByUser}/>
							<Stack.Screen name='PDFDisplayPage' component={PDFDisplayPage}/>
							<Stack.Screen name='VolAdminSearch' component={VolAdminSearch}/>
							<Stack.Screen name='VolAdminCeaseMember' component={VolAdminCeaseMember}/>
							<Stack.Screen name='FeedbackScreen' component={FeedbackScreen} options={{animation: "fade",presentation:"transparentModal", cardStyle: {backgroundColor: '#bdbdbdd0'}}}/>
							<Stack.Screen name='AllServicesListScreen' component={AllServicesListScreen} options={{animation: "slide_from_bottom", gestureEnabled: false, cardStyle: {backgroundColor: '#bdbdbdd0'}}}/>
							<Stack.Screen name='VolunteerNotes' component={VolunteerNotes}/>
							<Stack.Screen name='PositionHistory' component={PositionHistory}/>
							<Stack.Screen name='EquityDiversity' component={EquityDiversity}/>
							<Stack.Screen name='ErrorPage' component={ErrorPage}/>
							<Stack.Screen name='ExternalLoginPage' component={ExternalLoginPage}/>
							<Stack.Screen name='ExternalHomePage' component={ExternalHomePage}/>
						</Stack.Navigator>
					</NavigationContainer>
				</PaperProvider>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}
