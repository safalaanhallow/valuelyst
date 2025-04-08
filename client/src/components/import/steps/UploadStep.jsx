import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const UploadStep = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    // Check file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit');
      return;
    }
    
    setError(null);
    setFile(selectedFile);
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle submit (proceed to next step)
  const handleSubmit = () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    onFileUpload(file);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Upload CSV File</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload a CSV file containing property data to import as comparables. 
        Make sure your file includes headers and is properly formatted.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper 
        variant="outlined" 
        sx={{
          p: 3,
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderStyle: 'dashed',
          backgroundColor: 'background.paper',
          cursor: 'pointer',
        }}
        onClick={handleUploadClick}
      >
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>Click or drop file here</Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Support for CSV files only, maximum size 50MB
        </Typography>
      </Paper>
      
      {file && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Selected File:</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <List disablePadding>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={handleRemoveFile}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} 
                />
              </ListItem>
            </List>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={handleSubmit}
              fullWidth
              sx={{ maxWidth: 400 }}
            >
              Continue with this file
            </Button>
          </Box>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Requirements:</Typography>
        <Typography variant="body2" color="text.secondary">
          • File format must be CSV (comma-separated values)<br />
          • File must include column headers in the first row<br />
          • Maximum file size is 50 MB<br />
          • Data should be properly formatted (dates, numbers, etc.)<br />
          • UTF-8 encoding is recommended for best results
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="subtitle1" gutterBottom>Need a template?</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          You can download a sample CSV template with the recommended columns for comparable property data.
        </Typography>
        <Button variant="outlined">
          Download Template
        </Button>
      </Box>
    </Box>
  );
};

export default UploadStep;
