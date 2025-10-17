import React, {createContext, useState, useContext} from 'react';
import type { StatusBarStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

//set up our contexts for light / dark mode
type ThemeContextType = {
  isLightMode : boolean;
  toggleLightMode: () => void;
  statusBarColor : string;
  setStatusBarColor : (color : string) => void;
  statusBarStyle : StatusBarStyle | null | undefined;
  setStatusBarStyle : (style : StatusBarStyle | null | undefined) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider : React.FC<{ children: React.ReactNode }> = ({ children }) => {

  //toggling between light and dark theme
  const [isLightMode, setIsLightMode] = useState(true);
  const toggleLightMode = () => setIsLightMode(!isLightMode);

  //setting the color for the status bar & the icons ontop of the app
  const theme = useTheme();
  const [statusBarColor, setStatusBarColor] = useState('#fff');
  const [statusBarStyle, setStatusBarStyle] = useState<ThemeContextType["statusBarStyle"]>('dark-content');


  return (
    <ThemeContext.Provider value={{ isLightMode, toggleLightMode, statusBarColor, setStatusBarColor, statusBarStyle, setStatusBarStyle}}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within AppProvider')
    }
    
    return context;
}