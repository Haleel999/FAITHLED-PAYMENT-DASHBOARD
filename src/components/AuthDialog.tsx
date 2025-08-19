import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Alert
} from '@mui/material';
import { supabase } from '../utils/supabaseClient';

interface AuthDialogProps {
  open: boolean;
  onAuthSuccess: () => void;
}

export default function AuthDialog({ open, onAuthSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('jamiuhaleel@gmail.com');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset state when closing dialog
      setMode('login');
      setError('');
      setSuccessMsg('');
      setPassword('');
      setAdminKey('');
    }
  }, [open]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('Authentication error:', authError);
        
        // Handle specific error cases
        if (authError.status === 400) {
          throw new Error('Invalid email or password');
        } else if (authError.message.includes('database')) {
          throw new Error('Server configuration issue');
        } else {
          throw new Error(authError.message || 'Login failed');
        }
      }
      
      // Check for valid timestamps
      if (data?.user && (!data.user.created_at || !data.user.updated_at)) {
        console.warn('User timestamps are missing, setting fallback values');
        // Update session with fallback values
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
      }
      
      onAuthSuccess();
    } catch (e: any) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!adminKey || adminKey !== 'Haleel999') {
      setError('Invalid admin key');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      
      if (resetError) {
        console.error('Password reset error:', resetError);
        throw resetError;
      }
      
      setSuccessMsg('Password reset email sent! Check your inbox');
      setMode('login');
    } catch (e: any) {
      setError(e.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle>Admin Login</DialogTitle>
      
      <DialogContent>
        {mode === 'login' && (
          <Box sx={{ p: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            
            <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setMode('reset')}
              disabled={loading}
            >
              Forgot Password?
            </Button>
          </Box>
        )}
        
        {mode === 'reset' && (
          <Box sx={{ p: 2 }}>
            <Typography sx={{ mb: 2 }}>
              Enter your email and admin key to reset password
            </Typography>
            
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Admin Key"
              type="password"
              fullWidth
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
            
            <Button
              variant="contained"
              fullWidth
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </Button>
            
            <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setMode('login')}
              disabled={loading}
            >
              Back to Login
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}