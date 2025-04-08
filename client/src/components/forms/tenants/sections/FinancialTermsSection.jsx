import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Tooltip,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import {
  Info as InfoIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useFormikContext } from 'formik';

const FinancialTermsSection = ({ prefix, tenant, updateField }) => {
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();

  // Calculate rent when PSF value changes
  const calculateRent = (e) => {
    const rentPSF = parseFloat(e.target.value) || 0;
    handleChange(e);
    updateField('rentPSF', rentPSF);
    
    // Calculate annual rent
    if (tenant.leasedArea) {
      const rentAnnual = rentPSF * tenant.leasedArea;
      updateField('rentAnnual', rentAnnual);
      updateField('rentMonthly', rentAnnual / 12);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Financial Terms
        </Typography>
      </Grid>
      
      {/* Base Rent */}
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          required
          id={`${prefix}.rentPSF`}
          name={`${prefix}.rentPSF`}
          label="Annual Base Rent (PSF)"
          type="number"
          value={tenant.rentPSF}
          onChange={calculateRent}
          onBlur={handleBlur}
          error={touched.rentPSF && Boolean(errors.rentPSF)}
          helperText={touched.rentPSF && errors.rentPSF}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: <InputAdornment position="end">PSF</InputAdornment>
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.rentAnnual`}
          name={`${prefix}.rentAnnual`}
          label="Annual Rent"
          type="number"
          value={tenant.rentAnnual}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            readOnly: true,
          }}
          sx={{ bgcolor: 'action.hover' }}
          helperText="Automatically calculated"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.rentMonthly`}
          name={`${prefix}.rentMonthly`}
          label="Monthly Rent"
          type="number"
          value={tenant.rentMonthly}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            readOnly: true,
          }}
          sx={{ bgcolor: 'action.hover' }}
          helperText="Automatically calculated"
        />
      </Grid>
      
      {/* Escalations */}
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.rentEscalation`}
          name={`${prefix}.rentEscalation`}
          label="Rent Escalation Rate"
          type="number"
          value={tenant.rentEscalation}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('rentEscalation', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>
          }}
          helperText="Annual percentage increase"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.rentEscalationFrequency`}
          name={`${prefix}.rentEscalationFrequency`}
          label="Escalation Frequency"
          type="number"
          value={tenant.rentEscalationFrequency}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 12;
            handleChange(e);
            updateField('rentEscalationFrequency', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            endAdornment: <InputAdornment position="end">months</InputAdornment>
          }}
          helperText="How often rent increases (typically 12 months)"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.securityDeposit`}
          name={`${prefix}.securityDeposit`}
          label="Security Deposit"
          type="number"
          value={tenant.securityDeposit}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('securityDeposit', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>
          }}
        />
      </Grid>

      {/* Additional Financial Terms */}
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.freePeriod`}
          name={`${prefix}.freePeriod`}
          label="Free Rent Period"
          type="number"
          value={tenant.freePeriod || 0}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('freePeriod', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            endAdornment: <InputAdornment position="end">months</InputAdornment>
          }}
          helperText="Number of rent-free months at start of lease"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.percentageRent`}
          name={`${prefix}.percentageRent`}
          label="Percentage Rent"
          type="number"
          value={tenant.percentageRent || 0}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('percentageRent', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>
          }}
          helperText="Percentage of gross sales (for retail tenants)"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.salesBreakpoint`}
          name={`${prefix}.salesBreakpoint`}
          label="Sales Breakpoint"
          type="number"
          value={tenant.salesBreakpoint || 0}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('salesBreakpoint', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>
          }}
          helperText="Sales threshold for percentage rent"
        />
      </Grid>

      {/* Rent Schedule Button */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<VisibilityIcon />}
            onClick={() => {
              // This would open a dialog with a rent schedule
              // Implementation would be added later
              alert('Rent Schedule feature coming soon!');
            }}
          >
            View Rent Schedule
          </Button>
        </Box>
      </Grid>
      
      {/* Additional Notes */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          id={`${prefix}.financialNotes`}
          name={`${prefix}.financialNotes`}
          label="Financial Notes"
          value={tenant.financialNotes || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('financialNotes', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="Additional financial terms, unique payment arrangements, etc."
        />
      </Grid>
    </Grid>
  );
};

export default FinancialTermsSection;
