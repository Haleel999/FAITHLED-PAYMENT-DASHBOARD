
import React, { useState } from 'react';
import { 
  Box, Button, Stack, IconButton, Drawer, 
  useMediaQuery, Theme, Tooltip, Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeToggle from './DarkModeToggle';

interface Props {
  navs: string[];
  currentNav: string;
  onNavigate: (nav: string) => void;
  onAddTab?: () => void;
  toggleTheme: () => void;
  darkMode: boolean;
}

const NavBar: React.FC<Props> = ({ navs, currentNav, onNavigate, onAddTab, toggleTheme, darkMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Responsive breakpoints
  const isLargeScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const isMediumScreen = useMediaQuery((theme: Theme) => theme.breakpoints.between('md', 'lg'));
  const isTablet = useMediaQuery((theme: Theme) => theme.breakpoints.between('sm', 'md'));
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const renderNavItems = (dense = false) => (
    <>
      {navs.map(n => (
        <Button key={n} size="small" className="navbtn"
              variant={currentNav === n ? 'contained' : 'text'}
              onClick={() => onNavigate(n)}
              sx={{
                textTransform: 'none', 
                borderRadius: 2,
                bgcolor: currentNav === n ? 'primary.main' : 'transparent',
                color: currentNav === n ? '#fff' : 'text.primary'
              }}>
              {n}
            </Button>
      ))}
    </>
  );

  return (
  <Box className="headerbar" sx={{ borderBottom: '1px solid var(--border)', background: '#fafafa'}}>
      <Box className="container" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        py: 1,
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 900, 
            color: 'primary.main',
            fontSize: isLargeScreen ? '1.8rem' : '1.4rem',
            whiteSpace: 'nowrap',
            mr: 2
          }}
        >
          FAITHLED ACADEMY
        </Typography>
        
        {/* Desktop Navigation (Large screens) */}
        {isLargeScreen && (
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', flex: 1 }}>
            {renderNavItems()}
          </Stack>
        )}
        
        {/* Tablet/Laptop Navigation (Medium screens) */}
        {isMediumScreen && (
          <Box sx={{ 
            flex: 1, 
            display: 'flex',
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: '2px' },
            py: 1
          }}>
            <Stack direction="row" spacing={0.5}>
              {renderNavItems(true)}
            </Stack>
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          ml: 'auto'
        }}>
          <DarkModeToggle toggleTheme={toggleTheme} darkMode={darkMode} />

          {!!onAddTab && !isTablet && !isMobile && (
            <Button 
              size="small" 
              variant="outlined" 
              onClick={onAddTab}
              sx={{ fontSize: '0.8rem' }}
            >
              + Add Tab
            </Button>
          )}
          
          {(isTablet || isMobile) && (
            <IconButton 
              color="inherit" 
              onClick={() => setMobileOpen(true)}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ 
          '& .MuiDrawer-paper': { 
            background: 'var(--card)', 
            width: 250,
            px: 2,
            py: 3
          } 
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Navigation
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {renderNavItems()}
          {!!onAddTab && (
            <Button 
              variant="outlined" 
              onClick={onAddTab}
              sx={{ mt: 2 }}
            >
              + Add Custom Tab
            </Button>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default NavBar;