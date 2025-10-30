import React from 'react';
import { ThemeProvider } from './assets/ThemeContext';
import { AppProvider} from './helper/AppContext';
import { SecurityProvider } from './helper/SecurityContext';
import { DataProvider } from './helper/DataContext';
import MainApp from './MainApp';
import { dataHandlerModule } from './helper/DataHandlerModule';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <SecurityProvider>
          <DataProvider>
            <MainApp/>
          </DataProvider>
        </SecurityProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
