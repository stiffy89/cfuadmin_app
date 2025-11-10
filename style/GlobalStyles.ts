import {StyleSheet} from 'react-native';


const GlobalStyles = StyleSheet.create({
    AppBackground: {
        backgroundColor: '#fff'
    },
    safeAreaView: {
        flex: 1
    },
    pageContainer: {
        flex: 1,
        backgroundColor: '',
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
    },
    globalBorderRadius: {
        borderRadius: 10
    },
    page: {
        backgroundColor: '#fff',
        flex: 1
    },
    textInput: {
        paddingHorizontal: 20
    },
    disabledTextInput : {
        backgroundColor: '#efefef'
    },
    floatingButtonBottom: {
        position: 'relative',
        width: '100%'
    }
});

export default GlobalStyles;