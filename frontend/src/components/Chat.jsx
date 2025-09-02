import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material'
import {
  ExitToApp,
  DarkMode,
  LightMode,
  Menu,
  AccountCircle,
} from '@mui/icons-material'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import UsersList from './UsersList'
import Profile from './Profile'
import { useSocket } from '../hooks/useSocket'
import { supabase } from '../utils/supabase'

export default function Chat({ session, onLogout, onToggleMode, mode }) {
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUser, setTypingUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hovered, setHovered] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState(session.user)
  const socket = useSocket(session)
  const theme = useTheme()

  useEffect(() => {
    loadMessages()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on('users', (users) => {
      setOnlineUsers(users)
    })

    socket.on('typing', (username) => {
      if (username !== user.username) {
        setTypingUser(username)
        setTimeout(() => setTypingUser(null), 2000)
      }
    })

    socket.on('error', (error) => {
      setError(error.message)
    })

    return () => {
      socket.off('message')
      socket.off('users')
      socket.off('typing')
      socket.off('error')
    }
  }, [socket, user.username])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, user_id, created_at, profiles(username, avatar_url)')
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error

      setMessages(
        (data || []).map((msg) => ({
          ...msg,
          username: msg.profiles?.username || 'Unknown',
          avatar_url: msg.profiles?.avatar_url || null,
        }))
      )
    } catch (error) {
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = (content) => {
    if (socket) {
      socket.emit('message', { content })
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      onLogout()
    } catch {
      setError('Failed to logout')
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="static"
        sx={{
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 1,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Real-Time Chat</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Welcome, {user?.user_metadata?.username || user?.email}
            </Typography>

            <IconButton
              color="inherit"
              onClick={() => setProfileOpen(true)}
              aria-label="Profile"
            >
              <AccountCircle />
            </IconButton>

            <IconButton color="inherit" onClick={onToggleMode}>
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>

            <IconButton color="inherit" onClick={handleLogout}>
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          height: '4px',
          bgcolor: theme.palette.primary.main,
          boxShadow: `0 2px 4px ${theme.palette.primary.main}55`,
        }}
      />

      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Collapsible Users List */}
        <Box
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            width: hovered ? 250 : 50,
            transition: 'width 0.3s ease',
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 1 }}>
            <Menu />
          </Box>

          {hovered && (
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <UsersList users={onlineUsers} currentUser={user} />
            </Box>
          )}
        </Box>

        {/* Chat Window */}
        <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <MessageList
            messages={messages}
            currentUser={user}
            typingUser={typingUser}
          />
          <MessageInput
            onSendMessage={sendMessage}
            onTyping={() => socket?.emit('typing', { user: user.username })}
            disabled={loading || !socket}
          />
        </Paper>
      </Box>

      <Profile
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        session={session}
        onProfileUpdate={(newData) => {
          setUser((prev) => ({
            ...prev,
            user_metadata: { ...prev.user_metadata, ...newData },
          }))
        }}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}
