import React from 'react';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface Props {
  toggleTheme: () => void;
  darkMode: boolean;
}

export default function DarkModeToggle({ toggleTheme, darkMode }: Props) {
  return (
    <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle theme">
      {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}




