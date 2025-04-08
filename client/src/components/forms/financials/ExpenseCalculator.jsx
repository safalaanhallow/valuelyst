import React, { useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';

// Reusable expense input component
const ExpenseInput = ({ label, id, formik, category, fullWidth = true, readOnly = false }) => {
  // Use multiplier to convert between annual and monthly if needed
  const multiplier = formik.values.expenseFrequency === 'monthly' ? 12 : 1;
  
  // Calculate actual value based on frequency
  const displayValue = readOnly 
    ? formik.values[id] 
    : (formik.values.expenseFrequency === 'monthly' ? formik.values[id] / 12 : formik.values[id]);
  
  return (
    <TextField
      fullWidth={fullWidth}
      id={id}
      name={id}
      label={label}
      type="number"
      value={displayValue}
      onChange={(e) => {
        // Store all values as annual in the form state
        const newValue = parseFloat(e.target.value) || 0;
        const annualValue = formik.values.expenseFrequency === 'monthly' ? newValue * 12 : newValue;
        formik.setFieldValue(id, annualValue, false);
      }}
      onBlur={formik.handleBlur}
      error={formik.touched[id] && Boolean(formik.errors[id])}
      helperText={formik.touched[id] && formik.errors[id]}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
        readOnly: readOnly,
        sx: readOnly ? { bgcolor: '#f5f5f5' } : {}
      }}
      size="small"
      margin="dense"
    />
  );
};

const ExpenseCalculator = ({ formik }) => {
  // Define expense categories and items
  const expenseCategories = [
    {
      name: 'Tax & Insurance',
      items: [
        { id: 'propertyTaxes', label: 'Property Taxes' },
        { id: 'insurance', label: 'Insurance Premiums' },
      ]
    },
    {
      name: 'Utilities',
      items: [
        { id: 'utilities', label: 'Utilities (Total)' },
        { id: 'electricExpense', label: 'Electric' },
        { id: 'gasExpense', label: 'Gas' },
        { id: 'waterExpense', label: 'Water' },
        { id: 'sewerExpense', label: 'Sewer' },
      ]
    },
    {
      name: 'Repairs & Maintenance',
      items: [
        { id: 'repairsAndMaintenance', label: 'Repairs & Maintenance (Total)' },
        { id: 'cleaning', label: 'Cleaning/Janitorial' },
        { id: 'landscaping', label: 'Landscaping/Grounds' },
      ]
    },
    {
      name: 'Administrative',
      items: [
        { id: 'security', label: 'Security' },
        { id: 'generalAndAdmin', label: 'General & Administrative' },
        { id: 'payroll', label: 'Payroll' },
        { id: 'marketing', label: 'Advertising & Marketing' },
        { id: 'professionalFees', label: 'Professional Fees' },
      ]
    },
    {
      name: 'Reserves & Other',
      items: [
        { id: 'reserves', label: 'Replacement Reserves' },
        { id: 'otherExpenses', label: 'Other Expenses' },
      ]
    },
  ];
  
  // Calculate totals when expense values change
  useEffect(() => {
    // Gather all expense values
    const allExpenses = [
      formik.values.propertyTaxes || 0,
      formik.values.insurance || 0,
      formik.values.utilities || 0,
      formik.values.electricExpense || 0,
      formik.values.gasExpense || 0,
      formik.values.waterExpense || 0,
      formik.values.sewerExpense || 0,
      formik.values.repairsAndMaintenance || 0,
      formik.values.cleaning || 0,
      formik.values.landscaping || 0,
      formik.values.security || 0,
      formik.values.generalAndAdmin || 0,
      formik.values.payroll || 0,
      formik.values.marketing || 0,
      formik.values.professionalFees || 0,
      formik.values.reserves || 0,
      formik.values.otherExpenses || 0,
      formik.values.managementFee || 0, // From Income Statement
    ];
    
    // Calculate total operating expenses
    const totalOpEx = allExpenses.reduce((total, expense) => total + expense, 0);
    formik.setFieldValue('totalOperatingExpenses', totalOpEx, false);
    
    // Calculate NOI
    const egi = formik.values.effectiveGrossIncome || 0;
    const noi = egi - totalOpEx;
    formik.setFieldValue('netOperatingIncome', noi, false);
  }, [
    formik.values.propertyTaxes,
    formik.values.insurance,
    formik.values.utilities,
    formik.values.electricExpense,
    formik.values.gasExpense,
    formik.values.waterExpense,
    formik.values.sewerExpense,
    formik.values.repairsAndMaintenance,
    formik.values.cleaning,
    formik.values.landscaping,
    formik.values.security,
    formik.values.generalAndAdmin,
    formik.values.payroll,
    formik.values.marketing,
    formik.values.professionalFees,
    formik.values.reserves,
    formik.values.otherExpenses,
    formik.values.managementFee,
    formik.values.effectiveGrossIncome,
    formik.setFieldValue
  ]);

  // Handle frequency toggle change
  const handleFrequencyChange = (_, newFrequency) => {
    if (newFrequency !== null) {
      formik.setFieldValue('expenseFrequency', newFrequency, false);
    }
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Expense Calculator
        </Typography>
        
        <ToggleButtonGroup
          value={formik.values.expenseFrequency}
          exclusive
          onChange={handleFrequencyChange}
          aria-label="expense frequency"
          size="small"
        >
          <ToggleButton value="annual" aria-label="annual expenses">
            Annual
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="monthly expenses">
            Monthly
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
        Expenses are stored as annual values but can be entered as monthly or annual.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Expense Entry Section */}
        <Grid item xs={12} md={8}>
          {expenseCategories.map((category) => (
            <Box key={category.name} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {category.name}
              </Typography>
              
              <Grid container spacing={2}>
                {category.items.map((item) => (
                  <Grid item xs={12} sm={6} key={item.id}>
                    <ExpenseInput
                      label={item.label}
                      id={item.id}
                      formik={formik}
                      category={category.name}
                    />
                  </Grid>
                ))}
              </Grid>
              
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Grid>
        
        {/* Summary Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Expense Summary
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Property Taxes</TableCell>
                    <TableCell align="right">
                      ${formik.values.propertyTaxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>Insurance</TableCell>
                    <TableCell align="right">
                      ${formik.values.insurance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>Utilities</TableCell>
                    <TableCell align="right">
                      ${(formik.values.utilities + formik.values.electricExpense + formik.values.gasExpense + 
                         formik.values.waterExpense + formik.values.sewerExpense).toLocaleString('en-US', 
                         { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>Repairs & Maintenance</TableCell>
                    <TableCell align="right">
                      ${(formik.values.repairsAndMaintenance + formik.values.cleaning + 
                         formik.values.landscaping).toLocaleString('en-US', 
                         { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>Administrative</TableCell>
                    <TableCell align="right">
                      ${(formik.values.security + formik.values.generalAndAdmin + formik.values.payroll + 
                         formik.values.marketing + formik.values.professionalFees).toLocaleString('en-US', 
                         { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>Management Fee</TableCell>
                    <TableCell align="right">
                      ${formik.values.managementFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>Reserves & Other</TableCell>
                    <TableCell align="right">
                      ${(formik.values.reserves + formik.values.otherExpenses).toLocaleString('en-US', 
                         { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: '2px solid #e0e0e0' } }}>
                    <TableCell>Total Operating Expenses</TableCell>
                    <TableCell align="right">
                      ${formik.values.totalOperatingExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          <Paper elevation={1} sx={{ p: 2, bgcolor: '#e3f2fd' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Net Operating Income (NOI)
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body1">Effective Gross Income</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                ${formik.values.effectiveGrossIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body1">- Total Operating Expenses</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                -${formik.values.totalOperatingExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Net Operating Income</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: formik.values.netOperatingIncome >= 0 ? '#2e7d32' : '#d32f2f' }}>
                ${formik.values.netOperatingIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExpenseCalculator;
