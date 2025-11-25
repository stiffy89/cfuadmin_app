import { useState } from 'react';
import { View } from 'react-native';
import CustomText from '../../assets/CustomText';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { screenFlowModule } from '../../helper/ScreenFlowModule';
import { useAppContext } from '../../helper/AppContext';

const ExternalLoginPage = () => {

    const theme = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameErr, setUsernameErr] = useState(false);
    const [passwordErr, setPasswordErr] = useState(false);

    const appContext = useAppContext();

    return (
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
            <CustomText style={{ marginBottom: 20 }} variant='bodyLargeBold'>Username / Password</CustomText>
            <TextInput style={{ marginBottom: 5 }} activeOutlineColor={theme.colors.onBackground} mode='outlined' label='Username' value={username} onChangeText={setUsername} />
            {
                (usernameErr) &&
                <HelperText style={{ marginBottom: 20 }} type='error'>username cannot be empty</HelperText>
            }
            <TextInput style={{ marginBottom: 5 }} activeOutlineColor={theme.colors.onBackground} mode='outlined' label='Password' value={password} onChangeText={setPassword} secureTextEntry={true} />
            {
                (passwordErr) &&
                <HelperText style={{ marginBottom: 5 }} type='error'>password cannot be empty</HelperText>
            }
            <Button
                style={{marginTop: 20}}
                mode='contained'
                onPress={() => {
                    //navigate to fake home page
                    if (!username) {
                        setUsernameErr(true);
                    }
                    else {
                        setUsernameErr(false);
                    }

                    if (!password) {
                        setPasswordErr(true);
                    }
                    else {
                        setPasswordErr(false);
                    }

                    if (!username || !password){
                        return;
                    }

                    appContext.setShowBusyIndicator(true);
                    appContext.setShowDialog(true);

                    setTimeout(() => {
                        appContext.setShowDialog(false);
                        screenFlowModule.onNavigateToScreen('ExternalHomePage');

                    }, 2000)
                }}>
                Login
            </Button>
        </View>
    )
}

export default ExternalLoginPage;