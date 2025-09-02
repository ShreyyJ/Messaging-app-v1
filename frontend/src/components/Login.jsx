import { useState } from 'react'
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Container
} from '@mui/material'
import { Chat as ChatIcon } from '@mui/icons-material'
import { supabase } from '../utils/supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0]
            }
          }
        })
        if (error) throw error
        if (data.session) {
          onLogin(data.session)
          console.log("🔑 Auth result:", data)

        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        if (data.session) {
          onLogin(data.session)
          console.log("🔑 Auth result:", data)

        }
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <ChatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" aria-label="Chat Application">
              Real-Time Chat
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isSignUp ? 'Create your account' : 'Sign in to continue'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleAuth}>
            {isSignUp && (
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                inputProps={{ 'aria-label': 'Username' }}
              />
            )}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              inputProps={{ 'aria-label': 'Email address' }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              inputProps={{ 'aria-label': 'Password' }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              aria-label={isSignUp ? 'Create account' : 'Sign in'}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
            <Button
              fullWidth
              onClick={() => setIsSignUp(!isSignUp)}
              aria-label={isSignUp ? 'Switch to sign in' : 'Switch to sign up'}
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
