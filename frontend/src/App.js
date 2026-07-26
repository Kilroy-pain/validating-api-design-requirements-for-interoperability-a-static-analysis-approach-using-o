import React from 'react';
import { Button, Container, Typography } from '@mui/material';

function App() {
  return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        API Quality Validator
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
        Automated API Design Compliance Platform
      </Typography>
      <Button 
        variant="contained" 
        size="large" 
        sx={{ px: 6, py: 1.5, borderRadius: 2, textTransform: 'none' }}
      >
        Get Started
      </Button>
    </Container>
  );
}

export default App;