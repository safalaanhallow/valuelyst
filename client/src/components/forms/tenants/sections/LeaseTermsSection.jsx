import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormikContext } from 'formik';

const leaseTypes = [
  'Full Service Gross',
  'Modified Gross',
  'Triple Net (NNN)',
  'Double Net (NN)',
  'Single Net (N)',
  'Absolute Net',
  'Percentage Lease',
  'Ground Lease',
  'Graduated Lease',
  'Index Lease',
  'Sale-Leaseback',
  'Other'
];

const LeaseTermsSection = ({ prefix, tenant, updateField }) => {
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Lease Terms
          </Typography>
        </Grid>
        
        {/* Lease Dates */}
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Lease Start Date *"
            value={tenant.leaseStartDate}
            onChange={(newValue) => {
              updateField('leaseStartDate', newValue);
              
              // Recalculate original lease term
              if (tenant.leaseEndDate) {
                const startDate = new Date(newValue);
                const endDate = new Date(tenant.leaseEndDate);
                const termMonths = ((endDate.getFullYear() - startDate.getFullYear()) * 12) + 
                                  (endDate.getMonth() - startDate.getMonth());
                updateField('originalLeaseTerm', termMonths);
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required
                id={`${prefix}.leaseStartDate`}
                name={`${prefix}.leaseStartDate`}
                error={touched.leaseStartDate && Boolean(errors.leaseStartDate)}
                helperText={touched.leaseStartDate && errors.leaseStartDate}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Lease End Date *"
            value={tenant.leaseEndDate}
            onChange={(newValue) => {
              updateField('leaseEndDate', newValue);
              updateField('expirationDate', newValue); // Set expiration date same as lease end date by default
              
              // Recalculate original lease term
              if (tenant.leaseStartDate) {
                const startDate = new Date(tenant.leaseStartDate);
                const endDate = new Date(newValue);
                const termMonths = ((endDate.getFullYear() - startDate.getFullYear()) * 12) + 
                                  (endDate.getMonth() - startDate.getMonth());
                updateField('originalLeaseTerm', termMonths);
                
                // Default renewal notice date to 12 months before expiration
                const renewalDate = new Date(endDate);
                renewalDate.setFullYear(renewalDate.getFullYear() - 1);
                updateField('renewalNoticeDate', renewalDate);
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required
                id={`${prefix}.leaseEndDate`}
                name={`${prefix}.leaseEndDate`}
                error={touched.leaseEndDate && Boolean(errors.leaseEndDate)}
                helperText={touched.leaseEndDate && errors.leaseEndDate}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id={`${prefix}.originalLeaseTerm`}
            name={`${prefix}.originalLeaseTerm`}
            label="Original Lease Term"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">months</InputAdornment>,
              readOnly: true
            }}
            value={tenant.originalLeaseTerm}
            sx={{ bgcolor: 'action.hover' }}
            helperText="Automatically calculated"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id={`${prefix}.remainingTerm`}
            name={`${prefix}.remainingTerm`}
            label="Remaining Term"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">months</InputAdornment>,
              readOnly: true
            }}
            value={tenant.remainingTerm}
            sx={{ bgcolor: 'action.hover' }}
            helperText="Automatically calculated"
          />
        </Grid>
        
        {/* Lease Type */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id={`${prefix}.leaseType-label`}>Lease Type *</InputLabel>
            <Select
              labelId={`${prefix}.leaseType-label`}
              id={`${prefix}.leaseType`}
              name={`${prefix}.leaseType`}
              value={tenant.leaseType}
              label="Lease Type *"
              onChange={(e) => {
                handleChange(e);
                updateField('leaseType', e.target.value);
              }}
              required
            >
              {leaseTypes.map((type) => (
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
            id={`${prefix}.leaseTermDescription`}
            name={`${prefix}.leaseTermDescription`}
            label="Lease Term Description"
            value={tenant.leaseTermDescription || ''}
            onChange={(e) => {
              handleChange(e);
              updateField('leaseTermDescription', e.target.value);
            }}
            onBlur={handleBlur}
            helperText="Any special terms or description of lease period"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            id={`${prefix}.leaseComments`}
            name={`${prefix}.leaseComments`}
            label="Lease Comments"
            value={tenant.leaseComments || ''}
            onChange={(e) => {
              handleChange(e);
              updateField('leaseComments', e.target.value);
            }}
            onBlur={handleBlur}
            helperText="Any special provisions, comments about the lease structure, etc."
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default LeaseTermsSection;
