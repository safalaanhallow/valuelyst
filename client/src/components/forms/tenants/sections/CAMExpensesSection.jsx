import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { useFormikContext } from 'formik';

const expenseRecoveryTypes = [
  'Full Service (No Recovery)',
  'Base Year',
  'Expense Stop',
  'Triple Net (NNN)',
  'Modified Gross',
  'Fixed CAM',
  'Pro-rata Share',
  'Custom'
];

const CAMExpensesSection = ({ prefix, tenant, updateField }) => {
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          CAM & Operating Expenses
        </Typography>
      </Grid>
      
      {/* CAM Recovery */}
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth>
          <InputLabel id={`${prefix}.expenseRecoveryType-label`}>Expense Recovery Type</InputLabel>
          <Select
            labelId={`${prefix}.expenseRecoveryType-label`}
            id={`${prefix}.expenseRecoveryType`}
            name={`${prefix}.expenseRecoveryType`}
            value={tenant.expenseRecoveryType || ''}
            label="Expense Recovery Type"
            onChange={(e) => {
              handleChange(e);
              updateField('expenseRecoveryType', e.target.value);
            }}
          >
            {expenseRecoveryTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.baseYear`}
          name={`${prefix}.baseYear`}
          label="Base Year"
          value={tenant.baseYear || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('baseYear', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="Year for base year expenses (if applicable)"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.expenseStop`}
          name={`${prefix}.expenseStop`}
          label="Expense Stop"
          type="number"
          value={tenant.expenseStop || ''}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('expenseStop', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: <InputAdornment position="end">PSF</InputAdornment>
          }}
          helperText="Maximum landlord expense contribution (if applicable)"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.camSharePercentage`}
          name={`${prefix}.camSharePercentage`}
          label="CAM Share Percentage"
          type="number"
          value={tenant.camSharePercentage || ''}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('camSharePercentage', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>
          }}
          helperText="Tenant's pro-rata share of CAM expenses"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.annualCamAmount`}
          name={`${prefix}.annualCamAmount`}
          label="Annual CAM Amount"
          type="number"
          value={tenant.annualCamAmount || ''}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('annualCamAmount', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>
          }}
          helperText="Annual CAM charges (if fixed)"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.monthlyCamAmount`}
          name={`${prefix}.monthlyCamAmount`}
          label="Monthly CAM Amount"
          type="number"
          value={tenant.monthlyCamAmount || (tenant.annualCamAmount ? tenant.annualCamAmount / 12 : '')}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('monthlyCamAmount', value);
            updateField('annualCamAmount', value * 12);
          }}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>
          }}
          helperText="Monthly CAM payment"
        />
      </Grid>
      
      {/* Expense Responsibilities */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Expense Responsibilities
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={tenant.tenantPaysUtilities || false}
              onChange={(e) => {
                const checked = e.target.checked;
                handleChange(e);
                updateField('tenantPaysUtilities', checked);
              }}
              name={`${prefix}.tenantPaysUtilities`}
            />
          }
          label="Tenant Pays Utilities"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={tenant.tenantPaysRealEstateTaxes || false}
              onChange={(e) => {
                const checked = e.target.checked;
                handleChange(e);
                updateField('tenantPaysRealEstateTaxes', checked);
              }}
              name={`${prefix}.tenantPaysRealEstateTaxes`}
            />
          }
          label="Tenant Pays Real Estate Taxes"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={tenant.tenantPaysPropertyInsurance || false}
              onChange={(e) => {
                const checked = e.target.checked;
                handleChange(e);
                updateField('tenantPaysPropertyInsurance', checked);
              }}
              name={`${prefix}.tenantPaysPropertyInsurance`}
            />
          }
          label="Tenant Pays Property Insurance"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={tenant.tenantPaysHVACMaintenance || false}
              onChange={(e) => {
                const checked = e.target.checked;
                handleChange(e);
                updateField('tenantPaysHVACMaintenance', checked);
              }}
              name={`${prefix}.tenantPaysHVACMaintenance`}
            />
          }
          label="Tenant Pays HVAC Maintenance"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={tenant.tenantPaysJanitorial || false}
              onChange={(e) => {
                const checked = e.target.checked;
                handleChange(e);
                updateField('tenantPaysJanitorial', checked);
              }}
              name={`${prefix}.tenantPaysJanitorial`}
            />
          }
          label="Tenant Pays Janitorial"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={tenant.tenantPaysCAM || false}
              onChange={(e) => {
                const checked = e.target.checked;
                handleChange(e);
                updateField('tenantPaysCAM', checked);
              }}
              name={`${prefix}.tenantPaysCAM`}
            />
          }
          label="Tenant Pays CAM"
        />
      </Grid>

      {/* CAM Allocator Button */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<PieChartIcon />}
            onClick={() => {
              // This would open the CAM Charge Allocator dialog
              // Implementation would be added later
              alert('CAM Charge Allocator feature coming soon!');
            }}
          >
            Open CAM Charge Allocator
          </Button>
        </Box>
      </Grid>
      
      {/* Additional Notes */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          id={`${prefix}.camNotes`}
          name={`${prefix}.camNotes`}
          label="CAM & Expense Notes"
          value={tenant.camNotes || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('camNotes', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="Additional notes on expenses, CAM reconciliation, etc."
        />
      </Grid>
    </Grid>
  );
};

export default CAMExpensesSection;
