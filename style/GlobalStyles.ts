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
    },
    splashBackgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    backgroundImagePin: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    backgroundOverlay : {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        opacity: 0.6
    },
    inputRoundedCorners: {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomColor: 'grey',
        borderBottomWidth: 1
    },
    allRoundedCorners: {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    }
});

export default GlobalStyles;