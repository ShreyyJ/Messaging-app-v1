import { useState } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Paper,
  useTheme
} from '@mui/material'
import { Send, EmojiEmotions } from '@mui/icons-material'
import Picker from 'emoji-picker-react'

export default function MessageInput({ onSendMessage, disabled, onTyping }) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const theme = useTheme()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)
    if (onTyping) onTyping()
  }

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, position: 'relative', backgroundColor: theme.palette.background.paper }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', gap: 1 }}
      >
        <IconButton
          color="primary"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <EmojiEmotions />
        </IconButton>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={message}
          onChange={handleTyping}
          disabled={disabled}
          inputProps={{
            'aria-label': 'Message input',
            maxLength: 1000
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!message.trim() || disabled}
          aria-label="Send message"
        >
          <Send />
        </IconButton>
      </Box>

      {showEmojiPicker && (
        <Box sx={{ position: 'absolute', bottom: '60px', left: 10, zIndex: 10 }}>
          <Picker
            theme={theme.palette.mode}
            onEmojiClick={(emoji) => setMessage((prev) => prev + emoji.emoji)}
          />
        </Box>
      )}
    </Paper>
  )
}
