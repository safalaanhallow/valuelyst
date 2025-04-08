import React, { useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Slider,
  InputAdornment,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const CurrencyInput = ({ label, id, formik, readOnly = false, fullWidth = true, helperText = null }) => {
  return (
    <TextField
      fullWidth={fullWidth}
      id={id}
      name={id}
      label={label}
      type="number"
      value={formik.values[id]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[id] && Boolean(formik.errors[id])}
      helperText={formik.touched[id] && formik.errors[id] ? formik.errors[id] : helperText}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
        readOnly: readOnly,
        sx: readOnly ? { bgcolor: '#f5f5f5' } : {}
      }}
    />
  );
};

const IncomeStatementGrid = ({ formik }) => {
  // Calculate income statement totals when dependent values change
  useEffect(() => {
    // Calculate Potential Gross Income
    const baseRent = parseFloat(formik.values.baseRent) || 0;
    const percentageRent = parseFloat(formik.values.percentageRent) || 0;
    const otherIncome = parseFloat(formik.values.otherIncome) || 0;
    const expenseRecoveries = parseFloat(formik.values.expenseRecoveries) || 0;
    const pgi = baseRent + percentageRent + otherIncome + expenseRecoveries;
    
    // Calculate Vacancy Loss
    const vacancyRate = parseFloat(formik.values.vacancyRate) || 0;
    const vacancyLoss = (pgi * vacancyRate) / 100;
    
    // Calculate Effective Gross Income
    const egi = pgi - vacancyLoss;
    
    // Calculate Management Fee
    const mgmtFeePercentage = parseFloat(formik.values.managementFeePercentage) || 0;
    const mgmtFee = (egi * mgmtFeePercentage) / 100;
    
    // Update formik values
    formik.setFieldValue('potentialGrossIncome', pgi, false);
    formik.setFieldValue('vacancyLoss', vacancyLoss, false);
    formik.setFieldValue('effectiveGrossIncome', egi, false);
    formik.setFieldValue('managementFee', mgmtFee, false);
  }, [
    formik.values.baseRent,
    formik.values.percentageRent,
    formik.values.otherIncome,
    formik.values.expenseRecoveries,
    formik.values.vacancyRate,
    formik.values.managementFeePercentage,
    formik.setFieldValue
  ]);

  // Create income statement items for the table
  const incomeStatementItems = [
    { id: 'baseRent', label: 'Base Rent', type: 'income', editable: true },
    { id: 'percentageRent', label: 'Percentage Rent', type: 'income', editable: true },
    { id: 'otherIncome', label: 'Other Income', type: 'income', editable: true },
    { id: 'expenseRecoveries', label: 'Expense Recoveries (CAM, Taxes, Insurance)', type: 'income', editable: true },
    { id: 'potentialGrossIncome', label: 'Potential Gross Income (PGI)', type: 'subtotal', editable: false },
    { id: 'vacancyLoss', label: 'Less: Vacancy & Credit Loss', type: 'expense', editable: false },
    { id: 'effectiveGrossIncome', label: 'Effective Gross Income (EGI)', type: 'total', editable: false },
    { id: 'managementFee', label: 'Less: Management Fee', type: 'expense', editable: false },
  ];

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Income Statement
      </Typography>
      
      <Grid container spacing={3}>
        {/* Income Entry Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Income Sources
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CurrencyInput 
                label="Base Rent (Annual)" 
                id="baseRent"
                formik={formik}
                helperText="Annual base rent from all tenants"
              />
            </Grid>
            
            <Grid item xs={12}>
              <CurrencyInput 
                label="Percentage Rent (Annual)" 
                id="percentageRent"
                formik={formik}
                helperText="Rent based on tenant sales performance"
              />
            </Grid>
            
            <Grid item xs={12}>
              <CurrencyInput 
                label="Other Income (Annual)" 
                id="otherIncome"
                formik={formik}
                helperText="Parking, amenities, late fees, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <CurrencyInput 
                label="Expense Recoveries (Annual)" 
                id="expenseRecoveries"
                formik={formik}
                helperText="CAM, tax, insurance reimbursements"
              />
            </Grid>
          </Grid>
        </Grid>
        
        {/* Adjustments Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Income Adjustments
          </Typography>
          
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
            <Typography id="vacancy-rate-slider" gutterBottom>
              Vacancy Rate: {formik.values.vacancyRate}%
            </Typography>
            <Slider
              aria-labelledby="vacancy-rate-slider"
              value={formik.values.vacancyRate}
              onChange={(_, newValue) => {
                formik.setFieldValue('vacancyRate', newValue);
              }}
              valueLabelDisplay="auto"
              step={0.5}
              marks={[
                { value: 0, label: '0%' },
                { value: 5, label: '5%' },
                { value: 10, label: '10%' },
                { value: 15, label: '15%' },
                { value: 20, label: '20%' },
                { value: 25, label: '25%' }
              ]}
              min={0}
              max={25}
            />
          </Box>
          
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography id="management-fee-slider" gutterBottom>
              Management Fee: {formik.values.managementFeePercentage}% of EGI
            </Typography>
            <Slider
              aria-labelledby="management-fee-slider"
              value={formik.values.managementFeePercentage}
              onChange={(_, newValue) => {
                formik.setFieldValue('managementFeePercentage', newValue);
              }}
              valueLabelDisplay="auto"
              step={0.5}
              marks={[
                { value: 0, label: '0%' },
                { value: 3, label: '3%' },
                { value: 5, label: '5%' },
                { value: 7, label: '7%' },
                { value: 10, label: '10%' }
              ]}
              min={0}
              max={10}
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Vacancy Loss: ${formik.values.vacancyLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Management Fee: ${formik.values.managementFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Grid>
        
        {/* Income Statement Summary Table */}
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" gutterBottom>
            Income Statement Summary
          </Typography>
          
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Per SF</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incomeStatementItems.map((item) => {
                  // Determine styling based on item type
                  let rowStyle = {};
                  if (item.type === 'subtotal') {
                    rowStyle = { borderTop: '1px solid #e0e0e0', fontWeight: 'bold' };
                  } else if (item.type === 'total') {
                    rowStyle = { borderTop: '1px solid #e0e0e0', fontWeight: 'bold', backgroundColor: '#f0f8ff' };
                  } else if (item.type === 'expense') {
                    rowStyle = { color: '#d32f2f' };
                  }
                  
                  return (
                    <TableRow key={item.id} sx={rowStyle}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell align="right">
                        ${formik.values[item.id].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">$0.00</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Note: Per SF calculations will be available when property area is provided in the Physical Attributes section.
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IncomeStatementGrid;
