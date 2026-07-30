import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useConfirm } from 'material-ui-confirm';
import { formatDistanceToNow } from 'date-fns';
import api from '../api';

const severityColors = {
  error: '#ff4444',
  warning: '#ffbb33',
  info: '#33b5e5'
};

export default function RulesManager() {
  const [rules, setRules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [notification, setNotification] = useState(null);
  const confirm = useConfirm();

  const columns = [
    { field: 'id', headerName: 'Rule ID', width: 120 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { 
      field: 'severity', 
      headerName: 'Severity', 
      width: 120,
      renderCell: ({ value }) => (
        <Box sx={{ 
          bgcolor: severityColors[value],
          color: 'white',
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          {value.toUpperCase()}
        </Box>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 150,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Edit 
            sx={{ color: 'primary.main', cursor: 'pointer' }}
            onClick={() => handleEdit(row)}
          />
          <Delete 
            sx={{ color: 'error.main', cursor: 'pointer' }}
            onClick={() => handleDelete(row.id)}
          />
        </Box>
      )
    }
  ];

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await api.getRules();
      setRules(data);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to load rules' });
    }
  };

  const handleSubmit = async (ruleData) => {
    try {
      if (currentRule) {
        await api.updateRule(currentRule.id, ruleData);
      } else {
        await api.createRule(ruleData);
      }
      await fetchRules();
      setOpenDialog(false);
      setNotification({ type: 'success', message: `Rule ${currentRule ? 'updated' : 'created'} successfully` });
    } catch (error) {
      setNotification({ type: 'error', message: 'Operation failed' });
    }
  };

  const handleDelete = async (ruleId) => {
    try {
      await confirm({ description: 'This will permanently delete the rule.' });
      await api.deleteRule(ruleId);
      await fetchRules();
      setNotification({ type: 'success', message: 'Rule deleted' });
    } catch (error) {
      if (error !== 'cancel') {
        setNotification({ type: 'error', message: 'Deletion failed' });
      }
    }
  };

  const handleEdit = (rule) => {
    setCurrentRule(rule);
    setOpenDialog(true);
  };

  return (
    <Box sx={{ height: '70vh', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          New Rule
        </Button>
      </Box>

      <DataGrid
        rows={rules}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        sx={{ 
          border: 'none',
          '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(224, 224, 224, 0.2)' },
          '& .MuiDataGrid-columnHeaders': { backgroundColor: 'background.paper' }
        }}
      />

      <RuleDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setCurrentRule(null);
        }}
        onSubmit={handleSubmit}
        initialData={currentRule}
      />

      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
      >
        <Alert severity={notification?.type} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const RuleDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [formState, setFormState] = useState({
    id: '',
    description: '',
    severity: 'error',
    json_path: '',
    schema: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormState(initialData);
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit({
      ...formState,
      schema: formState.schema ? JSON.parse(formState.schema) : undefined
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
      <DialogContent sx={{ pt: 3, '& > *': { my: 2 } }}>
        <TextField
          label="Rule ID"
          fullWidth
          value={formState.id}
          onChange={(e) => setFormState(p => ({ ...p, id: e.target.value }))}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={2}
          value={formState.description}
          onChange={(e) => setFormState(p => ({ ...p, description: e.target.value }))}
        />
        <FormControl fullWidth>
          <InputLabel>Severity</InputLabel>
          <Select
            value={formState.severity}
            label="Severity"
            onChange={(e) => setFormState(p => ({ ...p, severity: e.target.value }))}
          >
            <MenuItem value="error">Error</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="info">Info</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="JSON Path"
          fullWidth
          value={formState.json_path}
          onChange={(e) => setFormState(p => ({ ...p, json_path: e.target.value }))}
        />
        <TextField
          label="JSON Schema"
          fullWidth
          multiline
          rows={4}
          placeholder="{\n  \"type\": \"object\",\n  \"required\": [...]\n}"
          value={formState.schema}
          onChange={(e) => setFormState(p => ({ ...p, schema: e.target.value }))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          {initialData ? 'Update Rule' : 'Create Rule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};