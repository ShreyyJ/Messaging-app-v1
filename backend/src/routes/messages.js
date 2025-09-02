import express from 'express'
import { supabase } from '../utils/supabase.js'

const router = express.Router()

// Get recent messages
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    res.json(data.reverse())
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router