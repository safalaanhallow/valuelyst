import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useEffect } from 'react';

const OperatingExpenses = ({ formik }) => {
  const { values, setFieldValue } = formik;
  const { income, vacancy, expenses, physicalAttributes } = values;

  // Calculate PGI, EGI
  const potentialGrossIncome = (
    parseFloat(income.baseRent || 0) +
    parseFloat(income.expenseReimbursements || 0) +
    parseFloat(income.percentageRent || 0) +
    parseFloat(income.otherIncome || 0)
  );

  const vacancyLoss = potentialGrossIncome * (parseFloat(vacancy.vacancyRate || 0) / 100);
  const creditLoss = parseFloat(vacancy.creditLossAmount || 0);

  const effectiveGrossIncome = potentialGrossIncome - vacancyLoss - creditLoss;

  // Calculate Total OpEx
  const totalOperatingExpenses = Object.values(expenses.operatingExpenses || {}).reduce(
    (total, value) => total + parseFloat(value || 0),
    0
  );

  // Calculate NOI
  const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;

  // Update NOI in formik state
  useEffect(() => {
    setFieldValue('expenses.netOperatingIncome', netOperatingIncome.toFixed(2));
  }, [netOperatingIncome, setFieldValue]);


  // Helper functions for display
  const calculateExpenseRatio = (expenseValue) => {
    if (effectiveGrossIncome === 0) return '0.00';
    const ratio = (parseFloat(expenseValue || 0) / effectiveGrossIncome) * 100;
    return ratio.toFixed(2);
  };

  const calculateExpensePerSqFt = (expenseValue) => {
    const buildingSize = parseFloat(physicalAttributes.buildingSize || 0);
    if (buildingSize === 0) return '0.00';
    const perSqFt = parseFloat(expenseValue || 0) / buildingSize;
    return perSqFt.toFixed(2);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Operating Expenses
      </Typography>
      <Typography variant="body2" paragraph>
        Enter all operating expenses for the property on an annual basis.
      </Typography>

      <Grid container spacing={3}>
        {/* Basic Property Information */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="buildingSize"
            name="physicalAttributes.buildingSize"
            label="Building Size (sq ft)"
            type="number"
            value={values.physicalAttributes.buildingSize  || ''}
            disabled
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="effectiveGrossIncome"
            name="effectiveGrossIncome"
            label="Effective Gross Income"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={effectiveGrossIncome.toFixed(2)}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="expenseYear"
            name="expenses.expenseYear"
            label="Expense Year"
            type="number"
            value={values.expenses.expenseYear || ''}
            onChange={formik.handleChange}
            error={formik.touched.expenses?.expenseYear && Boolean(formik.errors.expenses?.expenseYear)}
            helperText={formik.touched.expenses?.expenseYear && formik.errors.expenses?.expenseYear}
          />
        </Grid>

        {/* Expense Categories Table */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Expense Categories
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Expense Category</TableCell>
                  <TableCell align="right">Annual Amount</TableCell>
                  <TableCell align="right">% of EGI</TableCell>
                  <TableCell align="right">$ per sq ft</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[ { key: 'taxes', label: 'Real Estate Taxes' }, { key: 'insurance', label: 'Insurance' }, { key: 'utilities', label: 'Utilities' }, { key: 'maintenance', label: 'Repairs & Maintenance' }, { key: 'management', label: 'Property Management' }, { key: 'administrative', label: 'Administrative' }, { key: 'landscaping', label: 'Landscaping & Grounds' }, { key: 'security', label: 'Security' }, { key: 'cleaning', label: 'Cleaning & Janitorial' }, { key: 'reserves', label: 'Reserves for Replacement' }, { key: 'other', label: 'Other Expenses' }, ].map((expense) => (
                  <TableRow key={expense.key}>
                    <TableCell>{expense.label}</TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        id={`operatingExpenses.${expense.key}`}
                        name={`expenses.operatingExpenses.${expense.key}`}
                        type="number"
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        value={values.expenses.operatingExpenses[expense.key] || ''}
                        onChange={formik.handleChange}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {calculateExpenseRatio(values.expenses.operatingExpenses[expense.key])}%
                    </TableCell>
                    <TableCell align="right">
                      ${calculateExpensePerSqFt(values.expenses.operatingExpenses[expense.key])}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Total Row */}
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Total Operating Expenses</strong></TableCell>
                  <TableCell align="right">
                    <strong>${totalOperatingExpenses.toFixed(2)}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      {calculateExpenseRatio(totalOperatingExpenses)}%
                    </strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      ${calculateExpensePerSqFt(totalOperatingExpenses)}
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Net Operating Income */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h6">Net Operating Income (NOI)</Typography>
            <TextField
              id="netOperatingIncome"
              name="expenses.netOperatingIncome"
              label="Net Operating Income (NOI)"
              type="number"
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              value={values.expenses.netOperatingIncome || '0.00'}
              disabled
            />
          </Box>
        </Grid>
        
        {/* Additional Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="expenseNotes"
            name="expenses.expenseNotes"
            label="Expense Notes"
            multiline
            rows={3}
            value={formik.values.expenses.expenseNotes || ''}
            onChange={formik.handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OperatingExpenses;
