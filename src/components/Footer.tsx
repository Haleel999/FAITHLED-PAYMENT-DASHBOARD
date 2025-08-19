import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => (
  <Box
    sx={{
      width: '100%',
      py: 0,
      textAlign: 'center',
      color: 'text.secondary',
      fontWeight: 400,
      fontSize: '1rem',
      letterSpacing: 1,
      position: 'fixed',
      bottom: 0
    }}
  >
    <Typography component="span" sx={{ fontWeight: 400, fontSize: '1.2rem'  }}>
      Made with <span style={{color: '#e25555'}}>Love❤️</span> by Haleel&nbsp;✨🌟
    </Typography>
  </Box>
);

export default Footer;
