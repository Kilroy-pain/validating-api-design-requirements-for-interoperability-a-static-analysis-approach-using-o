import React, { useState, useEffect } from 'react';
import { Box, Chip, Typography, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Info, Error, Warning } from '@mui/icons-material';
import api from '../api';

const statusColors = {
  passed: '#4CAF50',
  failed: '#F44336'
};

export default function ReportsView() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const columns = [
    { 
      field: 'timestamp', 
      headerName: 'Date', 
      width: 180,
      valueFormatter: ({ value }) => new Date(value).toLocaleString()
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: ({ value }) => (
        <Chip 
          label={value.toUpperCase()} 
          sx={{ 
            bgcolor: statusColors[value] + '22',
            color: statusColors[value],
            fontWeight: 600
          }}
        />
      )
    },
    { 
      field: 'violation_count', 
      headerName: 'Violations', 
      width: 120,
      renderCell: ({ row }) => row.violations?.length || 0
    },
    { 
      field: 'details', 
      headerName: '', 
      width: 100,
      renderCell: ({ row }) => (
        <IconButton onClick={() => setSelectedReport(row)}>
          <Info sx={{ color: 'primary.main' }} />
        </IconButton>
      )
    }
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  return (
    <Box sx={{ height: '70vh', width: '100%' }}>
      <DataGrid
        rows={reports}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(224, 224, 224, 0.2)' },
          '& .MuiDataGrid-columnHeaders': { backgroundColor: 'background.paper' }
        }}
      />

      <ReportDetailsDialog
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </Box>
  );
}

const ReportDetailsDialog = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <Dialog open={!!report} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {report.status === 'failed' ? 
          <Error sx={{ color: 'error.main' }} /> : 
          <Warning sx={{ color: 'warning.main' }} />
        }
        Validation Report - {new Date(report.timestamp).toLocaleString()}
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          {report.violations?.length || 0} violations found
        </Typography>

        {report.violations?.map((violation, index) => (
          <Box 
            key={index}
            sx={{ 
              p: 2, 
              mb: 2, 
              borderRadius: 2, 
              bgcolor: 'background.paper',
              borderLeft: `4px solid ${severityColors[violation.severity]}`
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              [{violation.rule_id}] {violation.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Path: {violation.json_path}
            </Typography>
            {violation.schema_errors && (
              <Typography variant="body2" color="text.secondary">
                Schema Errors: {violation.schema_errors.join(', ')}
              </Typography>
            )}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};