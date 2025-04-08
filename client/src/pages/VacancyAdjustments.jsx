import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Divider
} from '@mui/material';
import { createFieldNameHelper, createChangeHandler } from '../utils/formHelpers';

const VacancyAdjustments = ({ formik }) => {
  // Create helper functions for this component
  const fieldName = createFieldNameHelper('vacancy');
  const handleChange = createChangeHandler(formik);
  
  // Ensure values is initialized
  const values = formik.values || {};
  // Function to calculate the vacancy loss amount based on percentage
  const calculateVacancyLoss = (percentage) => {
    const potentialGrossIncome = parseFloat(formik.values.potentialGrossIncome || 0);
    return (potentialGrossIncome * (percentage / 100)).toFixed(2);
  };

  // Update vacancy loss amount when percentage changes
  const handleVacancyRateChange = (event) => {
    const value = event.target.value;
    formik.setFieldValue('vacancyRate', value);
    formik.setFieldValue('vacancyLossAmount', calculateVacancyLoss(value));
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Vacancy & Credit Loss Adjustments
      </Typography>
      <Typography variant="body2" paragraph>
        Define vacancy rate, credit loss, and collection adjustments for accurate income projection.
      </Typography>

      <Grid container spacing={3}>
        {/* Market Conditions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Market Conditions
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="marketVacancyRate"
            name={fieldName('marketVacancyRate')}
            label="Market Vacancy Rate (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
            value={values.marketVacancyRate  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="submarketVacancyRate"
            name={fieldName('submarketVacancyRate')}
            label="Submarket Vacancy Rate (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
            value={values.submarketVacancyRate  || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Property Vacancy */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Property Vacancy
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Current Vacancy Rate (%)</Typography>
          <Box sx={{ px: 2 }}>
            <Slider
              value={parseFloat(formik.values.vacancyRate || 0)}
              onChange={(e, newValue) => {
                formik.setFieldValue('vacancyRate', newValue);
                formik.setFieldValue('vacancyLossAmount', calculateVacancyLoss(newValue));
              }}
              valueLabelDisplay="auto"
              step={0.5}
              marks
              min={0}
              max={25}
            />
          </Box>
          <TextField
            fullWidth
            margin="normal"
            id="vacancyRate"
            name={fieldName('vacancyRate')}
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
            value={values.vacancyRate  || ''}
            onChange={handleVacancyRateChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="vacancyLossAmount"
            name={fieldName('vacancyLossAmount')}
            label="Vacancy Loss Amount"
            type="number"
            InputProps={{ 
              startAdornment: <InputAdornment position="start">$</InputAdornment> 
            }}
            value={formik.values.vacancyLossAmount || calculateVacancyLoss(formik.values.vacancyRate || 0)}
            disabled
          />
        </Grid>

        {/* Credit Loss */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Credit Loss
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="creditLossRate"
            name={fieldName('creditLossRate')}
            label="Credit Loss Rate (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
            value={values.creditLossRate  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="creditLossAmount"
            name={fieldName('creditLossAmount')}
            label="Credit Loss Amount"
            type="number"
            InputProps={{ 
              startAdornment: <InputAdornment position="start">$</InputAdornment> 
            }}
            value={values.creditLossAmount  || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Concessions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Concessions
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="freeRentMonths"
            name={fieldName('freeRentMonths')}
            label="Free Rent Months (Average)"
            type="number"
            InputProps={{ 
              inputProps: { min: 0, step: 0.5 }
            }}
            value={values.freeRentMonths  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="tenantImprovementAllowance"
            name={fieldName('tenantImprovementAllowance')}
            label="TI Allowance ($/sq ft)"
            type="number"
            InputProps={{ 
              startAdornment: <InputAdornment position="start">$</InputAdornment> 
            }}
            value={values.tenantImprovementAllowance  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="concessionsNotes"
            name={fieldName('concessionsNotes')}
            label="Concessions Notes"
            multiline
            rows={3}
            value={values.concessionsNotes  || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Adjusted Gross Income */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Effective Gross Income
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="effectiveGrossIncome"
            name={fieldName('effectiveGrossIncome')}
            label="Effective Gross Income"
            type="number"
            InputProps={{ 
              startAdornment: <InputAdornment position="start">$</InputAdornment> 
            }}
            disabled
            value={
              (parseFloat(formik.values.potentialGrossIncome || 0) - 
               parseFloat(formik.values.vacancyLossAmount || 0) - 
               parseFloat(formik.values.creditLossAmount || 0)).toFixed(2)
            }
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default VacancyAdjustments;
