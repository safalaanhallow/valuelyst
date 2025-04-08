import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const RFPStage = ({ workflow, property, validationResults, onValidate, onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [formValues, setFormValues] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    assigned_to: workflow?.assigned_to || '',
    client_id: workflow?.client_id || '',
    due_date: workflow?.due_date ? new Date(workflow.due_date) : null
  });
  
  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };
  
  // Handle date changes
  const handleDateChange = (date) => {
    setFormValues({
      ...formValues,
      due_date: date
    });
  };
  
  // Save workflow changes
  const handleSave = async () => {
    try {
      await axios.put(`/api/workflows/${workflow.id}`, formValues);
      if (onUpdate) onUpdate();
      if (onValidate) onValidate();
    } catch (error) {
      console.error('Error updating workflow:', error);
    }
  };
  
  // Format property details
  const getPropertyDetails = () => {
    try {
      const identification = property.identification ? JSON.parse(property.identification) : {};
      const physical = property.physical ? JSON.parse(property.physical) : {};
      
      return {
        property_name: identification.property_name || 'Not specified',
        address: identification.address || 'Not specified',
        property_type: physical.property_type || 'Not specified',
      };
    } catch (error) {
      console.error('Error parsing property data:', error);
      return { property_name: 'Error', address: 'Error', property_type: 'Error' };
    }
  };
  
  const propertyDetails = getPropertyDetails();
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>RFP Stage</Typography>
      <Typography variant="body2" paragraph>
        In this initial stage, define the scope of the valuation project and assign resources.
      </Typography>
      
      {validationResults.issues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please complete all required fields to move to the next stage.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Workflow Details</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Workflow Name"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formValues.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="assigned-to-label">Assigned To</InputLabel>
                    <Select
                      labelId="assigned-to-label"
                      name="assigned_to"
                      value={formValues.assigned_to}
                      onChange={handleChange}
                      label="Assigned To"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {users.filter(user => user.role === 'Appraiser').map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} - Appraiser
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="client-label">Client</InputLabel>
                    <Select
                      labelId="client-label"
                      name="client_id"
                      value={formValues.client_id}
                      onChange={handleChange}
                      label="Client"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {users.filter(user => user.role === 'Client').map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} - Client
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Due Date"
                      value={formValues.due_date}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Property Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Property Name</Typography>
                <Typography variant="body1">{propertyDetails.property_name}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Address</Typography>
                <Typography variant="body1">{propertyDetails.address}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Property Type</Typography>
                <Typography variant="body1">{propertyDetails.property_type}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RFPStage;
