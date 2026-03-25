import { useAuth0 } from '@auth0/auth0-react';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Banner = () => {
  const [anchorEl, setAnchorEl] = useState(null);
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
      background: 'linear-gradient(90deg, #388e3c 0%, #1976d2 100%)',
      boxShadow: 3,
      width: '100%',
      flexShrink: 0,
    }}>
      <Toolbar sx={{ width: '100%' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{ mr: 2 }}
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
          <MenuItem onClick={() => handleNavigate('/settings')}>Settings</MenuItem>
          <MenuItem onClick={() => handleNavigate('/about')}>About</MenuItem>
        </Menu>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#fff' }}>
            LeisurePlan.App
          </Typography>
        </Box>
        {!isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  {user?.name || user?.email}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    color: '#fff',
                    borderColor: '#fff',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{
                  backgroundColor: '#fff',
                  color: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#f0f0f0'
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
