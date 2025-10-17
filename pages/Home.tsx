import { Button, TextInput, Surface, Text } from 'react-native-paper';
import CustomText from '../assets/CustomText';
import { View } from 'react-native';
import GlobalStyles from '../style/GlobalStyles';

import { useSecurityContext } from '../helper/SecurityContext';
import { useAppContext } from '../helper/AppContext';
import { authModule } from '../helper/AuthModule';
import { screenFlowModule } from '../helper/ScreenFlowModule';

const HomePage = () => {

    const { setShowBusyIndicator, setDialogMessage, setShowDialog } = useAppContext();
    const {setAuthType} = useSecurityContext();
    return (
        <View style={GlobalStyles.pageContainer}>
            <CustomText variant='bodyMediumItalic'>Open up App.tsx to start working on your app!</CustomText>
            <Button
                mode='contained'
                onPress={() => {
                    setShowBusyIndicator(true);
                    setDialogMessage('Please wait');
                    setShowDialog(true);
                }}
            >
                Show Busy
            </Button>
            <Button
                mode='contained'
                onPress={() => {
                    setShowBusyIndicator(false);
                    setDialogMessage('Generic dialog message here')
                    setShowDialog(true);
                }}
            >
                Show Message
            </Button>
            <Button
                mode='contained'
                onPress={async () => {
                    authModule.onLogOut()
                        .then(() => {
                            setAuthType('okta');
                            if (screenFlowModule.getScreenState()?.name !== 'LoginScreen'){
                                screenFlowModule.onNavigateToScreen('LoginScreen');
                            }
                        })
                        .catch((error) => {
                            //handle the error
                            console.log('error in logging out from pin page : ', error)
                        })
                }}
            >
                Log out
            </Button>
        </View>
    )
}

export default HomePage;