import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const ConfirmationStep = ({ result, onFinish, onImportMore }) => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h5" gutterBottom>Import Completed Successfully</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Your comparable properties have been successfully imported and are now available for use in your valuation workflow.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4, mt: 4, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="subtitle1" gutterBottom>Summary</Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary={`${result?.count || 0} Records Imported`} 
              secondary="Total number of comparable properties added" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <HomeIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={`Property ID: ${result?.property_id || ''}`} 
              secondary="Target property for these comparables" 
            />
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary" paragraph>
          The imported comparable properties are now available in the Bid and Research stages of your workflow, 
          and can be used for valuation analysis and adjustments.
        </Typography>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onImportMore}
        >
          Import More Comps
        </Button>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={onFinish}
        >
          Return to Workflow
        </Button>
      </Box>
    </Box>
  );
};

export default ConfirmationStep;
