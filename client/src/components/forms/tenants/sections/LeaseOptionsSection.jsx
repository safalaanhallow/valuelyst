import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormikContext } from 'formik';

const renewalTypes = [
  'Fixed Rate',
  'Market Rate',
  'Percentage Increase',
  'CPI Adjustment',
  'No Renewal Option',
  'Other'
];

const LeaseOptionsSection = ({ prefix, tenant, updateField }) => {
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Lease Options
          </Typography>
        </Grid>
        
        {/* Renewal Options */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Renewal Options
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Switch
                checked={tenant.hasRenewalOption || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  handleChange(e);
                  updateField('hasRenewalOption', checked);
                }}
                name={`${prefix}.hasRenewalOption`}
              />
            }
            label="Has Renewal Option"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id={`${prefix}.renewalOptionCount`}
            name={`${prefix}.renewalOptionCount`}
            label="Number of Renewal Options"
            type="number"
            value={tenant.renewalOptionCount || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              handleChange(e);
              updateField('renewalOptionCount', value);
            }}
            onBlur={handleBlur}
            disabled={!tenant.hasRenewalOption}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id={`${prefix}.renewalOptionTerm`}
            name={`${prefix}.renewalOptionTerm`}
            label="Renewal Term Length"
            type="number"
            value={tenant.renewalOptionTerm || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              handleChange(e);
              updateField('renewalOptionTerm', value);
            }}
            onBlur={handleBlur}
            InputProps={{
              endAdornment: <InputAdornment position="end">months</InputAdornment>
            }}
            disabled={!tenant.hasRenewalOption}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <FormControl fullWidth disabled={!tenant.hasRenewalOption}>
            <InputLabel id={`${prefix}.renewalType-label`}>Renewal Rate Type</InputLabel>
            <Select
              labelId={`${prefix}.renewalType-label`}
              id={`${prefix}.renewalType`}
              name={`${prefix}.renewalType`}
              value={tenant.renewalType || ''}
              label="Renewal Rate Type"
              onChange={(e) => {
                handleChange(e);
                updateField('renewalType', e.target.value);
              }}
            >
              {renewalTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            id={`${prefix}.renewalIncrease`}
            name={`${prefix}.renewalIncrease`}
            label="Renewal Rate Increase"
            type="number"
            value={tenant.renewalIncrease || 0}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              handleChange(e);
              updateField('renewalIncrease', value);
            }}
            onBlur={handleBlur}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
            disabled={!tenant.hasRenewalOption || tenant.renewalType !== 'Percentage Increase'}
            helperText="Percentage increase for renewal periods"
          />
        </Grid>
        
        {/* Termination Options */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Early Termination Options
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Switch
                checked={tenant.hasTerminationOption || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  handleChange(e);
                  updateField('hasTerminationOption', checked);
                }}
                name={`${prefix}.hasTerminationOption`}
              />
            }
            label="Has Termination Option"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id={`${prefix}.earliestTerminationDate`}
            name={`${prefix}.earliestTerminationDate`}
            label="Earliest Termination Date"
            type="date"
            value={tenant.earliestTerminationDate || ''}
            onChange={(e) => {
              handleChange(e);
              updateField('earliestTerminationDate', e.target.value);
            }}
            onBlur={handleBlur}
            InputLabelProps={{
              shrink: true,
            }}
            disabled={!tenant.hasTerminationOption}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id={`${prefix}.terminationFee`}
            name={`${prefix}.terminationFee`}
            label="Termination Fee"
            type="number"
            value={tenant.terminationFee || 0}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              handleChange(e);
              updateField('terminationFee', value);
            }}
            onBlur={handleBlur}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
            disabled={!tenant.hasTerminationOption}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id={`${prefix}.terminationNoticePeriod`}
            name={`${prefix}.terminationNoticePeriod`}
            label="Termination Notice Period"
            type="number"
            value={tenant.terminationNoticePeriod || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              handleChange(e);
              updateField('terminationNoticePeriod', value);
            }}
            onBlur={handleBlur}
            InputProps={{
              endAdornment: <InputAdornment position="end">days</InputAdornment>
            }}
            disabled={!tenant.hasTerminationOption}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id={`${prefix}.terminationConditions`}
            name={`${prefix}.terminationConditions`}
            label="Termination Conditions"
            value={tenant.terminationConditions || ''}
            onChange={(e) => {
              handleChange(e);
              updateField('terminationConditions', e.target.value);
            }}
            onBlur={handleBlur}
            disabled={!tenant.hasTerminationOption}
          />
        </Grid>
        
        {/* Other Options */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Other Lease Options
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Switch
                checked={tenant.hasExpansionOption || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  handleChange(e);
                  updateField('hasExpansionOption', checked);
                }}
                name={`${prefix}.hasExpansionOption`}
              />
            }
            label="Has Expansion Option"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Switch
                checked={tenant.hasRightOfFirstRefusal || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  handleChange(e);
                  updateField('hasRightOfFirstRefusal', checked);
                }}
                name={`${prefix}.hasRightOfFirstRefusal`}
              />
            }
            label="Right of First Refusal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Switch
                checked={tenant.hasRightOfFirstOffer || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  handleChange(e);
                  updateField('hasRightOfFirstOffer', checked);
                }}
                name={`${prefix}.hasRightOfFirstOffer`}
              />
            }
            label="Right of First Offer"
          />
        </Grid>
        
        {/* Additional Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            id={`${prefix}.optionsNotes`}
            name={`${prefix}.optionsNotes`}
            label="Options Notes"
            value={tenant.optionsNotes || ''}
            onChange={(e) => {
              handleChange(e);
              updateField('optionsNotes', e.target.value);
            }}
            onBlur={handleBlur}
            helperText="Additional details about lease options, conditions, or special clauses"
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default LeaseOptionsSection;
