import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Alert, CircularProgress
} from '@mui/material';
import { supabase } from '../utils/supabaseClient';

interface AuthDialogProps {
  open: boolean;
  onAuthSuccess: () => void;
}

export default function AuthDialog({ open, onAuthSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open) {
      setMode('login');
      setError('');
      setSuccessMsg('');
      setPassword('');
      setAdminKey('');
      setName('');
      setEmail('');
    }
  }, [open]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        throw new Error(authError.message || 'Login failed');
      }
      
      onAuthSuccess();
    } catch (e: any) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!adminKey || adminKey !== 'Faithled admin 999') {
      setError('Invalid admin key');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'admin'
          }
        }
      });
      
      if (signupError) {
        throw new Error(signupError.message || 'Signup failed');
      }
      
      setSuccessMsg('Account created! Please check your email to confirm your account.');
      setMode('login');
    } catch (e: any) {
      setError(e.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!adminKey || adminKey !== 'Faithled admin 999') {
      setError('Invalid admin key');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      
      if (resetError) {
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
      <DialogTitle>Admin Authentication</DialogTitle>
      
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
              autoComplete="off"
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="off"
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
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Button onClick={() => setMode('reset')} disabled={loading}>
                Forgot Password?
              </Button>
              <Button onClick={() => setMode('signup')} disabled={loading}>
                Sign Up as Admin
              </Button>
            </Box>
          </Box>
        )}
        
        {mode === 'signup' && (
          <Box sx={{ p: 2 }}>
            <Typography sx={{ mb: 2 }}>
              Sign up as a new administrator
            </Typography>
            
            <TextField
              label="Full Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="off"
            />
            
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="off"
            />
            
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="off"
            />
            
            <TextField
              label="Admin Key"
              type="password"
              fullWidth
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Required to create admin accounts"
              autoComplete="off"
            />
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
            
            <Button
              variant="contained"
              fullWidth
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
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
              autoComplete="off"
            />
            
            <TextField
              label="Admin Key"
              type="password"
              fullWidth
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="off"
            />
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
            
            <Button
              variant="contained"
              fullWidth
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
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