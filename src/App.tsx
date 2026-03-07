import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { store, persistor } from './store'
import { queryClient } from './services'
import { ToastProvider } from './components/providers/ToastProvider'
import { AppRouter } from './routes'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import CookieConsent from './components/CookieConsent'
import './App.css'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider>
              <AppRouter />
              <CookieConsent />
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
