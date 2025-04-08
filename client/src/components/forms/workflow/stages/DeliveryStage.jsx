import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Archive as ArchiveIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const DeliveryStage = ({ workflow, property, validationResults, onValidate, onUpdate }) => {
  const [deliveryData, setDeliveryData] = useState({
    delivery_date: null,
    delivery_method: 'Email',
    recipients: '',
    delivery_notes: '',
    delivery_status: 'Pending',
    delivery_checklist: JSON.stringify({
      valuation_report_included: false,
      comparables_data_included: false,
      financial_analysis_included: false,
      property_photos_included: false,
      market_data_included: false,
      delivered_to_client: false
    })
  });
  const [checklistItems, setChecklistItems] = useState({
    valuation_report_included: false,
    comparables_data_included: false,
    financial_analysis_included: false,
    property_photos_included: false,
    market_data_included: false,
    delivered_to_client: false
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deliveryConfirmationDialog, setDeliveryConfirmationDialog] = useState(false);
  
  // Load existing delivery data
  useEffect(() => {
    loadDeliveryData();
  }, []);
  
  // Load existing delivery data
  const loadDeliveryData = () => {
    try {
      if (property && property.valuations) {
        const valuations = JSON.parse(property.valuations);
        
        // Check for existing delivery data
        if (valuations.delivery_date) {
          setDeliveryData(prev => ({
            ...prev,
            delivery_date: valuations.delivery_date ? new Date(valuations.delivery_date) : null,
            delivery_method: valuations.delivery_method || 'Email',
            recipients: valuations.recipients || '',
            delivery_notes: valuations.delivery_notes || '',
            delivery_status: valuations.delivery_status || 'Pending'
          }));
        }
        
        // Load checklist if available
        if (valuations.delivery_checklist) {
          try {
            const checklist = JSON.parse(valuations.delivery_checklist);
            setChecklistItems(checklist);
          } catch (e) {
            console.error('Error parsing delivery checklist:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading delivery data:', error);
    }
  };
  
  // Handle delivery date change
  const handleDateChange = (date) => {
    setDeliveryData({
      ...deliveryData,
      delivery_date: date
    });
  };
  
  // Handle text field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setDeliveryData({
      ...deliveryData,
      [name]: value
    });
  };
  
  // Handle checklist item toggle
  const handleChecklistToggle = (item) => {
    const updatedChecklist = {
      ...checklistItems,
      [item]: !checklistItems[item]
    };
    
    setChecklistItems(updatedChecklist);
    setDeliveryData({
      ...deliveryData,
      delivery_checklist: JSON.stringify(updatedChecklist)
    });
  };
  
  // Check if all checklist items are checked
  const allChecked = () => {
    return Object.values(checklistItems).every(value => value === true);
  };
  
  // Save delivery data
  const saveDeliveryData = async () => {
    try {
      // Update property valuations with delivery data
      const currentValuations = property.valuations ? JSON.parse(property.valuations) : {};
      const updatedValuations = {
        ...currentValuations,
        delivery_date: deliveryData.delivery_date ? deliveryData.delivery_date.toISOString() : null,
        delivery_method: deliveryData.delivery_method,
        recipients: deliveryData.recipients,
        delivery_notes: deliveryData.delivery_notes,
        delivery_status: deliveryData.delivery_status,
        delivery_checklist: deliveryData.delivery_checklist
      };
      
      await axios.put(`/api/properties/${property.id}`, {
        valuations: JSON.stringify(updatedValuations)
      });
      
      if (onUpdate) onUpdate();
      if (onValidate) onValidate();
    } catch (error) {
      console.error('Error saving delivery data:', error);
    }
  };
  
  // Finalize delivery
  const finalizeDelivery = () => {
    // Check if all items are checked
    if (!allChecked()) {
      setDialogOpen(true);
      return;
    }
    
    // Open confirmation dialog
    setDeliveryConfirmationDialog(true);
  };
  
  // Complete the delivery process
  const completeDelivery = async () => {
    try {
      // Update delivery status
      const updatedDeliveryData = {
        ...deliveryData,
        delivery_status: 'Delivered',
        delivery_checklist: JSON.stringify(Object.fromEntries(
          Object.keys(checklistItems).map(key => [key, true])
        ))
      };
      
      setDeliveryData(updatedDeliveryData);
      
      // Update workflow status
      await axios.put(`/api/workflows/${workflow.id}`, {
        status: 'Completed'
      });
      
      // Update property valuations
      const currentValuations = property.valuations ? JSON.parse(property.valuations) : {};
      const updatedValuations = {
        ...currentValuations,
        delivery_date: updatedDeliveryData.delivery_date ? updatedDeliveryData.delivery_date.toISOString() : new Date().toISOString(),
        delivery_method: updatedDeliveryData.delivery_method,
        recipients: updatedDeliveryData.recipients,
        delivery_notes: updatedDeliveryData.delivery_notes,
        delivery_status: 'Delivered',
        delivery_checklist: updatedDeliveryData.delivery_checklist,
        completed_at: new Date().toISOString()
      };
      
      await axios.put(`/api/properties/${property.id}`, {
        valuations: JSON.stringify(updatedValuations)
      });
      
      setDeliveryConfirmationDialog(false);
      
      if (onUpdate) onUpdate();
      if (onValidate) onValidate();
    } catch (error) {
      console.error('Error completing delivery:', error);
      setDeliveryConfirmationDialog(false);
    }
  };
  
  // Format property valuation details
  const getValuationDetails = () => {
    try {
      if (!property || !property.valuations) return {};
      
      const valuations = JSON.parse(property.valuations);
      const identification = property.identification ? JSON.parse(property.identification) : {};
      
      return {
        propertyName: identification.property_name || 'Not specified',
        estimatedValue: valuations.estimated_value || 'Not specified',
        capRate: valuations.cap_rate || 'Not specified',
        valuePerSF: valuations.value_per_sf || 'Not specified',
        reviewStatus: valuations.review_status || 'Not specified'
      };
    } catch (error) {
      console.error('Error parsing property details:', error);
      return {};
    }
  };
  
  const valuationDetails = getValuationDetails();
  
  // Format client name if available
  const getClientName = () => {
    if (workflow && workflow.client_id) {
      return "Client ID: " + workflow.client_id;
    }
    return "Not specified";
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Delivery Stage</Typography>
      <Typography variant="body2" paragraph>
        In this final stage, prepare and deliver the valuation report and supporting materials to the client.
      </Typography>
      
      {validationResults.issues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {validationResults.issues.find(issue => issue.includes('deliver')) || 
           'Please complete the delivery checklist before finalizing the workflow.'}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Delivery Details</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Delivery Date"
                      value={deliveryData.delivery_date}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Delivery Method"
                    name="delivery_method"
                    value={deliveryData.delivery_method}
                    onChange={handleChange}
                    SelectProps={{
                      native: true
                    }}
                  >
                    <option value="Email">Email</option>
                    <option value="Portal">Client Portal</option>
                    <option value="Physical">Physical Delivery</option>
                    <option value="Virtual Meeting">Virtual Meeting</option>
                    <option value="In-Person Meeting">In-Person Meeting</option>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Recipients"
                    name="recipients"
                    value={deliveryData.recipients}
                    onChange={handleChange}
                    placeholder="Enter email addresses or recipient names"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Delivery Notes"
                    name="delivery_notes"
                    value={deliveryData.delivery_notes}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Enter any additional notes about the delivery..."
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={saveDeliveryData}
                >
                  Save Delivery Info
                </Button>
                
                <Button 
                  variant="contained" 
                  color="success" 
                  startIcon={<SendIcon />}
                  onClick={finalizeDelivery}
                  disabled={!deliveryData.delivery_date || !deliveryData.recipients}
                >
                  Finalize Delivery
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Delivery Checklist</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.valuation_report_included} 
                        onChange={() => handleChecklistToggle('valuation_report_included')}
                      />
                    }
                    label="Valuation Report Included"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.comparables_data_included} 
                        onChange={() => handleChecklistToggle('comparables_data_included')}
                      />
                    }
                    label="Comparable Properties Data Included"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.financial_analysis_included} 
                        onChange={() => handleChecklistToggle('financial_analysis_included')}
                      />
                    }
                    label="Financial Analysis Included"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.property_photos_included} 
                        onChange={() => handleChecklistToggle('property_photos_included')}
                      />
                    }
                    label="Property Photos & Maps Included"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.market_data_included} 
                        onChange={() => handleChecklistToggle('market_data_included')}
                      />
                    }
                    label="Market Data & Trends Included"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.delivered_to_client} 
                        onChange={() => handleChecklistToggle('delivered_to_client')}
                      />
                    }
                    label="Delivered to Client"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined"
                  color="primary"
                  onClick={saveDeliveryData}
                >
                  Save Checklist
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Valuation Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>{valuationDetails.propertyName}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>Client: {getClientName()}</Typography>
                <Typography variant="h5" color="primary" gutterBottom>${valuationDetails.estimatedValue}</Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Cap Rate</Typography>
                    <Typography variant="body1">{valuationDetails.capRate}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Value per SF</Typography>
                    <Typography variant="body1">${valuationDetails.valuePerSF}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Review Status</Typography>
                <Chip 
                  label={valuationDetails.reviewStatus}
                  color={valuationDetails.reviewStatus === 'Approved' ? 'success' : 
                         valuationDetails.reviewStatus === 'Revisions Needed' ? 'error' : 'primary'}
                  icon={valuationDetails.reviewStatus === 'Approved' ? <CheckCircleIcon /> : undefined}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Delivery Status</Typography>
                <Chip 
                  label={deliveryData.delivery_status}
                  color={deliveryData.delivery_status === 'Delivered' ? 'success' : 'default'}
                />
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Delivery Package Contents</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PdfIcon color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Property Valuation Report" 
                    secondary="Comprehensive analysis & value conclusion" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DocIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Comparable Properties Analysis" 
                    secondary="Detailed comparables data with adjustments" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DocIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Financial Analysis" 
                    secondary="Income approach & cash flow projections" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ArchiveIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Property Photos & Maps" 
                    secondary="Visual documentation of the property" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Market Analysis" 
                    secondary="Current market trends & forecasts" 
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  startIcon={<EmailIcon />}
                  disabled={deliveryData.delivery_status === 'Delivered'}
                  onClick={finalizeDelivery}
                  sx={{ width: '80%' }}
                >
                  {deliveryData.delivery_status === 'Delivered' ? 'Already Delivered' : 'Send Package to Client'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Incomplete Checklist Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Delivery Checklist Incomplete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Not all checklist items have been marked as completed. Do you want to mark all items as complete or continue preparing the delivery?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Continue Preparation</Button>
          <Button 
            onClick={() => {
              // Check all items
              const allChecked = Object.fromEntries(
                Object.keys(checklistItems).map(key => [key, true])
              );
              
              setChecklistItems(allChecked);
              setDeliveryData({
                ...deliveryData,
                delivery_checklist: JSON.stringify(allChecked)
              });
              
              setDialogOpen(false);
              setDeliveryConfirmationDialog(true);
            }} 
            color="primary"
          >
            Mark All Complete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delivery Confirmation Dialog */}
      <Dialog open={deliveryConfirmationDialog} onClose={() => setDeliveryConfirmationDialog(false)}>
        <DialogTitle>Confirm Final Delivery</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to finalize the delivery of the valuation report and supporting materials. This will mark the entire workflow as completed. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliveryConfirmationDialog(false)}>Cancel</Button>
          <Button onClick={completeDelivery} color="primary" variant="contained">
            Confirm Delivery
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryStage;
