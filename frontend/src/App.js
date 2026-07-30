import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, AppBar, Toolbar, Button, Container, CssBaseline } from '@mui/material';
import RulesManager from './components/RulesManager';
import ReportsView from './components/ReportsView';

function App() {
  return (
    <Router>
      <CssBaseline />
      <AppBar position="static" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 4 }}>
            <Button
              component={Link}
              to="/"
              sx={{ color: 'inherit', fontWeight: 600, textTransform: 'none' }}
            >
              Rules
            </Button>
            <Button
              component={Link}
              to="/reports"
              sx={{ color: 'inherit', fontWeight: 600, textTransform: 'none' }}
            >
              Reports
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Routes>
          <Route path="/" element={<RulesManager />} />
          <Route path="/reports" element={<ReportsView />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;