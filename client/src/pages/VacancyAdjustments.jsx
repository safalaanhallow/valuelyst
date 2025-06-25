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


const VacancyAdjustments = ({ formik }) => {
  const { income, vacancy } = formik.values;

  const potentialGrossIncome = (
      parseFloat(income.baseRent || 0) +
      parseFloat(income.expenseReimbursements || 0) +
      parseFloat(income.percentageRent || 0) +
      parseFloat(income.otherIncome || 0)
  );

  // Function to calculate the vacancy loss amount based on percentage
  const calculateVacancyLoss = (percentage) => {
    return (potentialGrossIncome * (parseFloat(percentage) / 100)).toFixed(2);
  };

  const effectiveGrossIncome = (
      potentialGrossIncome - 
      parseFloat(vacancy.vacancyLossAmount || calculateVacancyLoss(vacancy.vacancyRate)) - 
      parseFloat(vacancy.creditLossAmount || 0)
  ).toFixed(2);

  // Update vacancy loss amount when percentage changes
  const handleVacancyRateChange = (event) => {
    const value = event.target.value;
    formik.setFieldValue('vacancy.vacancyRate', value);
    formik.setFieldValue('vacancy.vacancyLossAmount', calculateVacancyLoss(value));
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
            name="vacancy.marketVacancyRate"
            label="Market Vacancy Rate (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
            value={formik.values.vacancy.marketVacancyRate  || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="submarketVacancyRate"
            name="vacancy.submarketVacancyRate"
            label="Submarket Vacancy Rate (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
            value={formik.values.vacancy.submarketVacancyRate  || ''}
            onChange={formik.handleChange}
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
              name="vacancy.vacancyRate"
              value={parseFloat(formik.values.vacancy.vacancyRate || 0)}
              onChange={(e, newValue) => {
                formik.setFieldValue('vacancy.vacancyRate', newValue);
                formik.setFieldValue('vacancy.vacancyLossAmount', calculateVacancyLoss(newValue));
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
            name="vacancy.vacancyRate"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
            value={formik.values.vacancy.vacancyRate  || ''}
            onChange={handleVacancyRateChange}
            error={formik.touched.vacancy?.vacancyRate && Boolean(formik.errors.vacancy?.vacancyRate)}
            helperText={formik.touched.vacancy?.vacancyRate && formik.errors.vacancy?.vacancyRate}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="vacancyLossAmount"
            name="vacancy.vacancyLossAmount"
            label="Vacancy Loss Amount"
            type="number"
            InputProps={{ 
              startAdornment: <InputAdornment position="start">$</InputAdornment> 
            }}
            value={formik.values.vacancy.vacancyLossAmount || calculateVacancyLoss(formik.values.vacancy.vacancyRate || 0)}
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
            name="vacancy.creditLossRate"
            label="Credit Loss Rate (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
            value={formik.values.vacancy.creditLossRate  || ''}
            onChange={formik.handleChange}
            error={formik.touched.vacancy?.creditLossRate && Boolean(formik.errors.vacancy?.creditLossRate)}
            helperText={formik.touched.vacancy?.creditLossRate && formik.errors.vacancy?.creditLossRate}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="creditLossAmount"
            name="vacancy.creditLossAmount"
            label="Credit Loss Amount"
            type="number"
            InputProps={{ 
              startAdornment: <InputAdornment position="start">$</InputAdornment> 
            }}
            value={formik.values.vacancy.creditLossAmount  || ''}
            onChange={formik.handleChange}
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
            name="vacancy.freeRentMonths"
            label="Free Rent Months (Average)"
            type="number"
            InputProps={{ 
              inputProps: { min: 0, step: 0.5 }
            }}
            value={formik.values.vacancy.freeRentMonths  || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="tenantImprovementAllowance"
            name="vacancy.tenantImprovementAllowance"
            label="TI Allowance ($/sq ft)"
            type="number"
            InputProps={{ 
              startAdornment: <InputAdornment position="start">$</InputAdornment> 
            }}
            value={formik.values.vacancy.tenantImprovementAllowance  || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="concessionsNotes"
            name="vacancy.concessionsNotes"
            label="Concessions Notes"
            multiline
            rows={3}
            value={formik.values.vacancy.concessionsNotes  || ''}
            onChange={formik.handleChange}
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
    name="vacancy.effectiveGrossIncome"
    label="Effective Gross Income"
    type="number"
    InputProps={{ 
      startAdornment: <InputAdornment position="start">$</InputAdornment> 
    }}
    disabled
    value={effectiveGrossIncome}
  />
</Grid>
</Grid>
</Paper>
);
};

export default VacancyAdjustments;
