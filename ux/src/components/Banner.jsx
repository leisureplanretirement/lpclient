import { useAuth0 } from '@auth0/auth0-react';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Avatar, Box, Button, Divider, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fonts } from '../theme';

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

  const c = theme.palette.brand;
  const go = (path) => () => handleNavigate(path);

  return (
    <AppBar position="static" elevation={0} sx={{
      background: isDark
        ? `linear-gradient(90deg, ${c.parchment} 0%, ${c.surface} 100%)`
        : `linear-gradient(90deg, ${c.parchment} 0%, ${c.goldSoft} 100%)`,
      color: c.ink,
      borderBottom: `1px solid ${c.line}`,
      width: '100%',
      flexShrink: 0,
    }}>
      <Toolbar sx={{ width: '100%', gap: 1 }}>
        {!canceled && (
          <>
            <IconButton
              edge="start"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ mr: 1, color: c.ink }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleNavigate('/', { state: { newChat: Date.now() } })}>New chat</MenuItem>
              <MenuItem onClick={go('/portrait')}>My portrait &amp; wins</MenuItem>
              <MenuItem onClick={go('/community')}>Community</MenuItem>
              <Divider />
              <MenuItem onClick={go('/sessions')}>Past chats</MenuItem>
              <MenuItem onClick={go('/billing')}>Billing</MenuItem>
              <MenuItem onClick={go('/settings')}>Settings</MenuItem>
              <MenuItem onClick={go('/help')}>Help</MenuItem>
              <MenuItem onClick={go('/about')}>About</MenuItem>
            </Menu>
          </>
        )}
        <Box
          sx={{ flexGrow: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}
          onClick={() => navigate('/')}
        >
          <Box aria-hidden sx={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: `radial-gradient(circle at 35% 30%, ${c.gold} 0%, ${c.coral} 55%, ${c.plum} 100%)`,
            boxShadow: `0 0 0 3px ${c.goldSoft}`,
          }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography component="div" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.1, color: c.ink }}>
              LeisurePlan
            </Typography>
            <Typography component="div" noWrap sx={{ color: c.teal, fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.2 }}>
              Money calm, with room for fun
            </Typography>
          </Box>
        </Box>
        {!canceled && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mr: 1 }}>
            <Button size="small" onClick={go('/portrait')} sx={{ color: c.ink }}>Portrait</Button>
            <Button size="small" onClick={go('/community')} sx={{ color: c.ink }}>Community</Button>
          </Box>
        )}
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
                  <MenuItem onClick={() => { setUserAnchorEl(null); navigate('/portrait'); }}>My portrait</MenuItem>
                  <MenuItem onClick={handleLogout}>Log out</MenuItem>
                </Menu>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={handleLogin}>
                Log in
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Banner;
