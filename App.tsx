import React from 'react';
import { ThemeProvider } from './assets/ThemeContext';
import { AppProvider} from './helper/AppContext';
import { SecurityProvider } from './helper/SecurityContext';
import MainApp from './MainApp';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <SecurityProvider>
          <MainApp />
        </SecurityProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
