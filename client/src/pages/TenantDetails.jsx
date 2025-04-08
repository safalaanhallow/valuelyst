import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { createFieldNameHelper, createChangeHandler } from '../utils/formHelpers';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const TenantDetails = ({ formik, setFormik, dialogMode = false }) => {
  // Create helper functions for this component
  const fieldName = createFieldNameHelper('tenants');
  const handleChange = createChangeHandler(formik);
  
  // Ensure values is initialized
  const values = formik.values || {};
  // State to track which tenant accordion is expanded
  const [expandedTenant, setExpandedTenant] = useState(null);
  
  // When in dialog mode, expand the first tenant automatically
  useEffect(() => {
    if (dialogMode && formik.values.tenants && formik.values.tenants.length > 0) {
      setExpandedTenant(formik.values.tenants[0].id);
    }
  }, [dialogMode, formik.values.tenants]);

  // Function to add a new tenant
  const addTenant = () => {
    const tenants = [...(formik.values.tenants || [])];
    const newTenantId = tenants.length > 0 ? Math.max(...tenants.map(t => t.id)) + 1 : 1;
    
    tenants.push({
      id: newTenantId,
      tenantName: '',
      leaseStart: '',
      leaseExpiry: '',
      squareFeet: '',
      baseRentPSF: '',
      monthlyRent: '',
      annualRent: '',
      securityDeposit: '',
      tiAllowance: '',
      leaseType: '',
      escalationRate: '',
      camCharges: '',
      renewalOptions: [],
      notes: ''
    });
    
    formik.setFieldValue('tenants', tenants);
    setExpandedTenant(newTenantId);
  };

  // Function to remove a tenant
  const removeTenant = (id) => {
    const tenants = formik.values.tenants.filter(tenant => tenant.id !== id);
    formik.setFieldValue('tenants', tenants);
    if (expandedTenant === id) {
      setExpandedTenant(null);
    }
  };

  // Handle tenant field changes
  const handleTenantChange = (id, field, value) => {
    const tenants = [...(formik.values.tenants || [])];
    const tenantIndex = tenants.findIndex(tenant => tenant.id === id);
    
    if (tenantIndex >= 0) {
      tenants[tenantIndex][field] = value;
      
      // Auto-calculate related fields
      if (field === 'baseRentPSF' || field === 'squareFeet') {
        const baseRentPSF = parseFloat(tenants[tenantIndex].baseRentPSF) || 0;
        const squareFeet = parseFloat(tenants[tenantIndex].squareFeet) || 0;
        
        // Calculate annual rent
        const annualRent = baseRentPSF * squareFeet;
        tenants[tenantIndex].annualRent = annualRent.toFixed(2);
        
        // Calculate monthly rent
        const monthlyRent = annualRent / 12;
        tenants[tenantIndex].monthlyRent = monthlyRent.toFixed(2);
      }
      
      // If monthly rent is changed directly, update annual rent
      if (field === 'monthlyRent') {
        const monthlyRent = parseFloat(tenants[tenantIndex].monthlyRent) || 0;
        tenants[tenantIndex].annualRent = (monthlyRent * 12).toFixed(2);
        
        // Update PSF if square feet is available
        const squareFeet = parseFloat(tenants[tenantIndex].squareFeet) || 0;
        if (squareFeet > 0) {
          tenants[tenantIndex].baseRentPSF = ((monthlyRent * 12) / squareFeet).toFixed(2);
        }
      }
      
      // If annual rent is changed directly, update monthly rent
      if (field === 'annualRent') {
        const annualRent = parseFloat(tenants[tenantIndex].annualRent) || 0;
        tenants[tenantIndex].monthlyRent = (annualRent / 12).toFixed(2);
        
        // Update PSF if square feet is available
        const squareFeet = parseFloat(tenants[tenantIndex].squareFeet) || 0;
        if (squareFeet > 0) {
          tenants[tenantIndex].baseRentPSF = (annualRent / squareFeet).toFixed(2);
        }
      }
      
      formik.setFieldValue('tenants', tenants);
    }
  };

  // Function to add a renewal option to a tenant
  const addRenewalOption = (tenantId) => {
    const tenants = [...(formik.values.tenants || [])];
    const tenantIndex = tenants.findIndex(tenant => tenant.id === tenantId);
    
    if (tenantIndex >= 0) {
      const renewalOptions = [...(tenants[tenantIndex].renewalOptions || [])];
      renewalOptions.push({
        termYears: '',
        renewalRate: '',
        rateType: 'fixed' // 'fixed', 'market', 'percentage'
      });
      tenants[tenantIndex].renewalOptions = renewalOptions;
      formik.setFieldValue('tenants', tenants);
    }
  };

  // Function to remove a renewal option
  const removeRenewalOption = (tenantId, optionIndex) => {
    const tenants = [...(formik.values.tenants || [])];
    const tenantIndex = tenants.findIndex(tenant => tenant.id === tenantId);
    
    if (tenantIndex >= 0) {
      const renewalOptions = [...(tenants[tenantIndex].renewalOptions || [])];
      renewalOptions.splice(optionIndex, 1);
      tenants[tenantIndex].renewalOptions = renewalOptions;
      formik.setFieldValue('tenants', tenants);
    }
  };

  // Handle changes in renewal option fields
  const handleRenewalOptionChange = (tenantId, optionIndex, field, value) => {
    const tenants = [...(formik.values.tenants || [])];
    const tenantIndex = tenants.findIndex(tenant => tenant.id === tenantId);
    
    if (tenantIndex >= 0) {
      const renewalOptions = [...(tenants[tenantIndex].renewalOptions || [])];
      renewalOptions[optionIndex][field] = value;
      tenants[tenantIndex].renewalOptions = renewalOptions;
      formik.setFieldValue('tenants', tenants);
    }
  };

  // Total leased area and weighted average calculations
  const calculateTotalLeasedArea = () => {
    const tenants = formik.values.tenants || [];
    return tenants.reduce((sum, tenant) => sum + (parseFloat(tenant.squareFeet) || 0), 0);
  };

  const calculateWeightedAverageRent = () => {
    const tenants = formik.values.tenants || [];
    const totalArea = calculateTotalLeasedArea();
    
    if (totalArea === 0) return 0;
    
    const weightedSum = tenants.reduce((sum, tenant) => {
      const area = parseFloat(tenant.squareFeet) || 0;
      const rentPSF = parseFloat(tenant.baseRentPSF) || 0;
      return sum + (area * rentPSF);
    }, 0);
    
    return (weightedSum / totalArea).toFixed(2);
  };

  const calculateTotalAnnualRent = () => {
    const tenants = formik.values.tenants || [];
    return tenants.reduce((sum, tenant) => sum + (parseFloat(tenant.annualRent) || 0), 0).toFixed(2);
  };

  return (
    <Box sx={{ p: dialogMode ? 0 : 3 }}>
      {!dialogMode && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Tenant Details & Lease Terms
          </Typography>
          <Typography variant="body2" paragraph>
            Add all tenants and their lease information for the property.
          </Typography>
        </Paper>
      )}

      {/* Tenant Summary Info */}
      {!dialogMode && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Total Leased Area"
              value={`${calculateTotalLeasedArea().toLocaleString()} SF`}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Weighted Average Rent"
              value={`$${calculateWeightedAverageRent()} PSF`}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Total Annual Rent"
              value={`$${calculateTotalAnnualRent()}`}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Number of Tenants"
              value={(formik.values.tenants || []).length}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      )}

      {/* Tenant List */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Tenants
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={addTenant}
        >
          Add Tenant
        </Button>
      </Box>

      {(formik.values.tenants || []).length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 4 }}>
          No tenants added. Click "Add Tenant" to add tenant and lease information.
        </Typography>
      ) : (
        <Box>
          {(formik.values.tenants || []).map((tenant) => (
            <Accordion 
              key={tenant.id} 
              expanded={expandedTenant === tenant.id}
              onChange={() => setExpandedTenant(expandedTenant === tenant.id ? null : tenant.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {tenant.tenantName || `Tenant ${tenant.id}`}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {tenant.squareFeet ? `${tenant.squareFeet.toLocaleString()} SF` : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tenant.baseRentPSF ? `$${tenant.baseRentPSF} PSF` : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tenant.leaseExpiry ? `Expires: ${new Date(tenant.leaseExpiry).toLocaleDateString()}` : ''}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Basic Tenant Info */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tenant Name"
                      value={tenant.tenantName || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'tenantName', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Leased Square Feet"
                      type="number"
                      value={tenant.squareFeet || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'squareFeet', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Lease Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={tenant.leaseStart || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'leaseStart', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Lease Expiry Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={tenant.leaseExpiry || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'leaseExpiry', e.target.value)}
                    />
                  </Grid>
                  
                  {/* Rent Information */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }}>
                      <Typography variant="subtitle2">Rent Information</Typography>
                    </Divider>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Base Rent PSF"
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={tenant.baseRentPSF || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'baseRentPSF', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Monthly Rent"
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={tenant.monthlyRent || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'monthlyRent', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Annual Rent"
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={tenant.annualRent || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'annualRent', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Lease Type</InputLabel>
                      <Select
                        value={tenant.leaseType || ''}
                        label="Lease Type"
                        onChange={(e) => handleTenantChange(tenant.id, 'leaseType', e.target.value)}
                      >
                        <MenuItem value=""><em>Select Type</em></MenuItem>
                        <MenuItem value="nnn">Triple Net (NNN)</MenuItem>
                        <MenuItem value="modified">Modified Gross</MenuItem>
                        <MenuItem value="gross">Full Service Gross</MenuItem>
                        <MenuItem value="absolute">Absolute Net</MenuItem>
                        <MenuItem value="percentage">Percentage</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Annual Escalation Rate"
                      type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                      value={tenant.escalationRate || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'escalationRate', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="CAM Charges (PSF)"
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={tenant.camCharges || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'camCharges', e.target.value)}
                    />
                  </Grid>
                  
                  {/* Additional Terms */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }}>
                      <Typography variant="subtitle2">Additional Terms</Typography>
                    </Divider>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Security Deposit"
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={tenant.securityDeposit || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'securityDeposit', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="TI Allowance (PSF)"
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={tenant.tiAllowance || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'tiAllowance', e.target.value)}
                    />
                  </Grid>
                  
                  {/* Renewal Options */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">Renewal Options</Typography>
                      <Button 
                        size="small" 
                        startIcon={<AddIcon />}
                        onClick={() => addRenewalOption(tenant.id)}
                      >
                        Add Option
                      </Button>
                    </Box>
                    
                    {(tenant.renewalOptions || []).length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No renewal options. Click "Add Option" to add renewal terms.
                      </Typography>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Term (Years)</TableCell>
                              <TableCell>Rate Type</TableCell>
                              <TableCell>Rate/Percentage</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(tenant.renewalOptions || []).map((option, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={option.termYears || ''}
                                    onChange={(e) => handleRenewalOptionChange(tenant.id, idx, 'termYears', e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormControl fullWidth size="small">
                                    <Select
                                      value={option.rateType || 'fixed'}
                                      onChange={(e) => handleRenewalOptionChange(tenant.id, idx, 'rateType', e.target.value)}
                                    >
                                      <MenuItem value="fixed">Fixed Rate</MenuItem>
                                      <MenuItem value="market">Market Rate</MenuItem>
                                      <MenuItem value="percentage">% of Market</MenuItem>
                                    </Select>
                                  </FormControl>
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={option.renewalRate || ''}
                                    onChange={(e) => handleRenewalOptionChange(tenant.id, idx, 'renewalRate', e.target.value)}
                                    InputProps={{
                                      startAdornment: option.rateType === 'fixed' ? <InputAdornment position="start">$</InputAdornment> : null,
                                      endAdornment: option.rateType === 'percentage' ? <InputAdornment position="end">%</InputAdornment> : null
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => removeRenewalOption(tenant.id, idx)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Grid>
                  
                  {/* Notes */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tenant Notes"
                      multiline
                      rows={3}
                      value={tenant.notes || ''}
                      onChange={(e) => handleTenantChange(tenant.id, 'notes', e.target.value)}
                    />
                  </Grid>
                  
                  {/* Delete Tenant */}
                  <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => removeTenant(tenant.id)}
                    >
                      Remove Tenant
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Additional Property-Wide Lease Notes */}
      <Box sx={{ mt: 4 }}>
        <TextField
          fullWidth
          id="leaseNotes"
          name={fieldName('leaseNotes')}
          label="Additional Lease Notes"
          multiline
          rows={3}
          value={values.leaseNotes  || ''}
          onChange={handleChange}
        />
      </Box>
    </Box>
  );
};

export default TenantDetails;
