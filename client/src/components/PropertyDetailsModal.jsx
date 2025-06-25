import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import PropertyDataViewer from './PropertyDataViewer';

const PropertyDetailsModal = ({ open, onClose, property }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Calculate data points count
  const dataPointsCount = useMemo(() => {
    if (!property?.rawData) return 0;
    return Object.keys(property.rawData).length;
  }, [property]);

  // Handle copy to clipboard
  const handleCopyData = async () => {
    if (!property?.rawData) return;
    
    try {
      const dataText = JSON.stringify(property.rawData, null, 2);
      await navigator.clipboard.writeText(dataText);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy data:', err);
    }
  };

  // Handle download as JSON
  const handleDownloadData = () => {
    if (!property?.rawData) return;
    
    const dataStr = JSON.stringify(property.rawData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${property.name || 'property'}_data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!property?.rawData || !searchTerm) return property?.rawData || {};
    
    const filtered = {};
    Object.entries(property.rawData).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(value).toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered[key] = value;
      }
    });
    return filtered;
  }, [property?.rawData, searchTerm]);

  if (!property) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="div">
              Property Details: {property.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.address}, {property.city} • {dataPointsCount} data points
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Copy Data to Clipboard">
              <IconButton onClick={handleCopyData} size="small">
                <CopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Data as JSON">
              <IconButton onClick={handleDownloadData} size="small">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search across all data points..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {searchTerm && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Showing {Object.keys(filteredData).length} of {dataPointsCount} data points
            </Typography>
          )}
        </Box>
        
        <Box sx={{ height: 'calc(90vh - 200px)', overflow: 'auto' }}>
          <PropertyDataViewer 
            property={{
              ...property,
              rawData: filteredData
            }}
            compact={false}
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyDetailsModal;
