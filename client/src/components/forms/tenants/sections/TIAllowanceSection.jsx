import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Button,
  Box,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useFormikContext } from 'formik';

const TIAllowanceSection = ({ prefix, tenant, updateField }) => {
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();

  // Calculate TI allowance when PSF value changes
  const calculateTIAllowance = (e) => {
    const tiAllowancePSF = parseFloat(e.target.value) || 0;
    handleChange(e);
    updateField('tiAllowancePSF', tiAllowancePSF);
    
    // Calculate total TI allowance
    if (tenant.leasedArea) {
      const tiAllowanceTotal = tiAllowancePSF * tenant.leasedArea;
      updateField('tiAllowanceTotal', tiAllowanceTotal);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Tenant Improvement Allowance
        </Typography>
      </Grid>
      
      {/* TI Allowance Rates */}
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.tiAllowancePSF`}
          name={`${prefix}.tiAllowancePSF`}
          label="TI Allowance (PSF)"
          type="number"
          value={tenant.tiAllowancePSF || 0}
          onChange={calculateTIAllowance}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: <InputAdornment position="end">PSF</InputAdornment>
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.tiAllowanceTotal`}
          name={`${prefix}.tiAllowanceTotal`}
          label="Total TI Allowance"
          type="number"
          value={tenant.tiAllowanceTotal || 0}
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
          id={`${prefix}.tiRemainingAllowance`}
          name={`${prefix}.tiRemainingAllowance`}
          label="Remaining TI Allowance"
          type="number"
          value={tenant.tiRemainingAllowance || tenant.tiAllowanceTotal || 0}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('tiRemainingAllowance', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>
          }}
        />
      </Grid>
      
      {/* TI Project Tracking */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          TI Project Tracking
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.tiContractor`}
          name={`${prefix}.tiContractor`}
          label="TI Contractor"
          value={tenant.tiContractor || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('tiContractor', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.tiCompletionDate`}
          name={`${prefix}.tiCompletionDate`}
          label="TI Completion Date"
          type="date"
          value={tenant.tiCompletionDate || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('tiCompletionDate', e.target.value);
          }}
          onBlur={handleBlur}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.tiBudget`}
          name={`${prefix}.tiBudget`}
          label="TI Budget"
          type="number"
          value={tenant.tiBudget || 0}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('tiBudget', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>
          }}
        />
      </Grid>
      
      {/* TI Amortization */}
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.tiAmortizationRate`}
          name={`${prefix}.tiAmortizationRate`}
          label="TI Amortization Rate"
          type="number"
          value={tenant.tiAmortizationRate || 0}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('tiAmortizationRate', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>
          }}
          helperText="Interest rate for amortized TI"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.tiAmortizationTerm`}
          name={`${prefix}.tiAmortizationTerm`}
          label="TI Amortization Term"
          type="number"
          value={tenant.tiAmortizationTerm || 0}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('tiAmortizationTerm', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            endAdornment: <InputAdornment position="end">months</InputAdornment>
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.tiAmortizedAmount`}
          name={`${prefix}.tiAmortizedAmount`}
          label="Amortized TI Amount"
          type="number"
          value={tenant.tiAmortizedAmount || 0}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('tiAmortizedAmount', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>
          }}
        />
      </Grid>

      {/* TI Calculator Button */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<CalculateIcon />}
            onClick={() => {
              // This would open the TI Allowance Calculator dialog
              // Implementation would be added later
              alert('TI Allowance Calculator feature coming soon!');
            }}
          >
            Open TI Allowance Calculator
          </Button>
        </Box>
      </Grid>
      
      {/* Additional Notes */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          id={`${prefix}.tiNotes`}
          name={`${prefix}.tiNotes`}
          label="TI Notes"
          value={tenant.tiNotes || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('tiNotes', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="Additional notes about TI projects, special arrangements, etc."
        />
      </Grid>
    </Grid>
  );
};

export default TIAllowanceSection;
