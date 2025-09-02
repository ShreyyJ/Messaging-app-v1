import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Paper,
  useTheme,
} from '@mui/material'
import { Person, Circle } from '@mui/icons-material'

export default function UsersList({ users, currentUser }) {
  const theme = useTheme()

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        overflow: 'auto',
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography variant="h6" aria-label="Online users">
          Online Users ({users.length})
        </Typography>
      </Box>
      <List dense role="list" aria-label="List of online users">
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Circle sx={{ fontSize: 12, color: 'success.main' }} />
                }
              >
                <Avatar src={user.avatar_url}>
                  <Person />
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  fontWeight={user.id === currentUser?.id ? 'bold' : 'normal'}
                  color={user.id === currentUser?.id ? 'primary' : 'textPrimary'}
                >
                  {user.username} {user.id === currentUser?.id && '(You)'}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
