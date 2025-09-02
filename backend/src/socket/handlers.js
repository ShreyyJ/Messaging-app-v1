// backend/src/socket/handlers.js
import { supabase } from '../utils/supabase.js'

let onlineUsers = {}

export function handleConnection(socket, io) {
  console.log("🔌 New client connected:", socket.id)

  const token = socket.handshake.auth?.token
  if (!token) {
    console.error("❌ No auth token provided")
    return
  }

  supabase.auth.getUser(token).then(async ({ data: { user }, error }) => {
    if (error || !user) {
      console.error("❌ Auth failed on connect:", error)
      return
    }

    // ✅ Get profile from profiles table
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle()

    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            username: user.email,
            avatar_url: null,
          },
        ])
        .select()
        .single()
      if (!insertError) profile = newProfile
    }

    const username = profile?.username || user.email
    const avatarUrl = profile?.avatar_url || null

    onlineUsers[user.id] = { id: user.id, username, avatar_url: avatarUrl }
    io.emit("users", Object.values(onlineUsers))

    // ✅ Handle messages
    socket.on("message", async (msg) => {
      try {
        const { data: freshProfile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single()

        const uname = freshProfile?.username || user.email
        const aUrl = freshProfile?.avatar_url || null

        const { data, error } = await supabase
          .from("messages")
          .insert([
            {
              content: msg.content,
              user_id: user.id,
              username: uname,
              avatar_url: aUrl,
            },
          ])
          .select()

        if (error) {
          console.error("❌ Insert failed:", error)
          return
        }

        io.emit("message", data[0])
      } catch (err) {
        console.error("Unexpected error saving message:", err)
      }
    })

    socket.on("disconnect", () => {
      console.log("⚠️ Client disconnected:", socket.id)
      delete onlineUsers[user.id]
      io.emit("users", Object.values(onlineUsers))
    })
  })
}
