import { useAuth0 } from '@auth0/auth0-react';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Avatar, Box, Button, Divider, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Banner = ({ canceled = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState(null);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path, options) => {
    navigate(path, options);
    handleMenuClose();
  };

  const handleLogin = () => {
    console.log('Login button clicked, calling loginWithRedirect...');
    loginWithRedirect().catch(err => {
      console.error('Login error:', err);
    });
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } });
  };

  return (
    <AppBar position="static" sx={{
      background: isDark
        ? 'linear-gradient(90deg, #1e2433 0%, #2d1f5e 100%)'
        : 'linear-gradient(90deg, #d1fae5 0%, #dbeafe 100%)',
      boxShadow: 'none',
      borderBottom: `1px solid ${isDark ? '#2d3748' : '#bfdbfe'}`,
      width: '100%',
      flexShrink: 0,
    }}>
      <Toolbar sx={{ width: '100%' }}>
        {!canceled && (
          <>
            <IconButton
              edge="start"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ mr: 2, color: isDark ? '#e2e8f0' : '#1e3a2e' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleNavigate('/', { state: { newChat: Date.now() } })}>New Chat</MenuItem>
              <MenuItem onClick={() => handleNavigate('/sessions')}>Sessions</MenuItem>
              <MenuItem onClick={() => handleNavigate('/billing')}>Billing</MenuItem>
              <MenuItem onClick={() => handleNavigate('/settings')}>Settings</MenuItem>
              <MenuItem onClick={() => handleNavigate('/help')}>Help</MenuItem>
              <MenuItem onClick={() => handleNavigate('/about')}>About</MenuItem>
            </Menu>
          </>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e3a2e', textShadow: isDark ? '0 1px 8px rgba(167,139,250,0.18)' : 'none' }}>
            LeisurePlan.App
          </Typography>
        </Box>
        {!isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title={user?.name || user?.email || ''}>
                  <Avatar
                    src={user?.picture}
                    alt={user?.name || user?.email}
                    sx={{ width: 32, height: 32, cursor: 'pointer' }}
                    slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
                    onClick={e => setUserAnchorEl(e.currentTarget)}
                  />
                </Tooltip>
                <Menu
                  anchorEl={userAnchorEl}
                  open={Boolean(userAnchorEl)}
                  onClose={() => setUserAnchorEl(null)}
                >
                  <MenuItem disabled sx={{ opacity: '1 !important' }}>
                    <Typography variant="body2">{user?.name || user?.email}</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                onClick={handleLogin}
                sx={{
                  borderColor: isDark ? 'rgba(100, 181, 246, 0.5)' : 'rgba(30, 58, 46, 0.4)',
                  color: isDark ? '#93c5fd' : '#1e3a2e',
                  '&:hover': {
                    borderColor: isDark ? '#93c5fd' : '#1e3a2e',
                    backgroundColor: isDark ? 'rgba(100, 181, 246, 0.08)' : 'rgba(30, 58, 46, 0.06)',
                  }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Banner;
