import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, Drawer, Toolbar } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Home', path: '/' },
];

const drawerWidth = 220;

const Menu = () => {
  const location = useLocation();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: '#f5f5f5',
          top: '64px', // Adjust if your AppBar is a different height
          height: 'calc(100% - 64px)',
        },
      }}
    >
      {/* <Toolbar /> removed, handled by top offset */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Menu;
