import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  TextField,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { PhotoCamera } from '@mui/icons-material'
import { supabase } from '../utils/supabase'

export default function Profile({ open, onClose, session, onProfileUpdate }) {
  const user = session.user
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  // ✅ Load profile from profiles table
  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setUsername(data.username || '')
        setAvatarUrl(data.avatar_url || '')
      }
    }
    if (open) {
      loadProfile()
    }
  }, [user.id, open])

  // ✅ Handle avatar upload
  const handleUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('Upload failed:', uploadError.message)
      setUploading(false)
      return
    }

    // ✅ Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    setAvatarUrl(data.publicUrl)
    setUploading(false)
  }

  // ✅ Save profile changes
  const handleSave = async () => {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      username,
      avatar_url: avatarUrl,
    })

    if (profileError) {
      console.error('Profile update failed:', profileError.message)
      return
    }

    onProfileUpdate({ username, avatar_url: avatarUrl })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>My Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Avatar src={avatarUrl} sx={{ width: 80, height: 80 }} />
          <IconButton color="primary" component="label" disabled={uploading}>
            <PhotoCamera />
            <input hidden accept="image/*" type="file" onChange={handleUpload} />
          </IconButton>
        </Box>
        <TextField
          margin="normal"
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Email: {user.email}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
