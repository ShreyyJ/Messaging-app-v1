import { useEffect, useRef } from 'react'
import {
  Box,
  List,
  ListItem,
  Avatar,
  Typography,
  Paper,
  Fade,
  useTheme,
} from '@mui/material'
import { Person } from '@mui/icons-material'

export default function MessageList({ messages, currentUser, typingUser }) {
  const messagesEndRef = useRef(null)
  const theme = useTheme()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, typingUser])

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: 2,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
      }}
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((message) => {
          const isOwn = message.user_id === currentUser?.id
          return (
            <Fade in key={message.id}>
              <ListItem
                sx={{
                  display: 'flex',
                  flexDirection: isOwn ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 1,
                }}
              >
                <Avatar src={message.avatar_url}>
                  <Person />
                </Avatar>
                <Paper
                  elevation={2}
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    borderRadius: 3,
                    backgroundColor: isOwn
                      ? theme.palette.primary.main
                      : theme.palette.mode === 'light'
                      ? theme.palette.grey[200]
                      : theme.palette.grey[800],
                    color: isOwn
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {message.username || 'Unknown'}
                  </Typography>
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', textAlign: 'right', opacity: 0.7 }}
                  >
                    {new Date(message.created_at).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </ListItem>
            </Fade>
          )
        })}

        {typingUser && (
          <ListItem>
            <Typography variant="body2" color="textSecondary">
              {typingUser} is typing...
            </Typography>
          </ListItem>
        )}
      </List>
      <div ref={messagesEndRef} />
    </Box>
  )
}
