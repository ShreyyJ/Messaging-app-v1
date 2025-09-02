import { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Login from './components/Login'
import Chat from './components/Chat'
import { supabase } from './utils/supabase'

export default function App() {
  const [session, setSession] = useState(null)
  const [mode, setMode] = useState('light')

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light')

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!session ? (
        <Login onLogin={setSession} />
      ) : (
        <Chat
          session={session}
          onLogout={() => setSession(null)}
          onToggleMode={toggleMode}
          mode={mode}
        />
      )}
    </ThemeProvider>
  )
}
