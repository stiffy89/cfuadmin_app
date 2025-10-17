import {StyleSheet} from 'react-native';

const GlobalStyles = StyleSheet.create({
    safeAreaView: {
        flex: 1
    },
    pageContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogContainer : {
        alignItems: 'center',
        justifyContent: 'center',
    },
    surface : {
        padding: 8,
        height: 80,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },
    pinAsterisk : {
        fontSize: 25
    }
});

export default GlobalStyles;