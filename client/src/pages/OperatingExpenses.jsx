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
import { createFieldNameHelper, createChangeHandler } from '../utils/formHelpers';

const OperatingExpenses = ({ formik }) => {
  // Create helper functions for this component
  const fieldName = createFieldNameHelper('expenses');
  const handleChange = createChangeHandler(formik);
  
  // Ensure values is initialized
  const values = formik.values || {};
  // Calculate totals
  const calculateTotalOpEx = () => {
    const expenses = formik.values.operatingExpenses || {};
    let total = 0;
    
    // Add all expense categories
    total += parseFloat(expenses.taxes || 0);
    total += parseFloat(expenses.insurance || 0);
    total += parseFloat(expenses.utilities || 0);
    total += parseFloat(expenses.maintenance || 0);
    total += parseFloat(expenses.management || 0);
    total += parseFloat(expenses.administrative || 0);
    total += parseFloat(expenses.landscaping || 0);
    total += parseFloat(expenses.security || 0);
    total += parseFloat(expenses.cleaning || 0);
    total += parseFloat(expenses.reserves || 0);
    total += parseFloat(expenses.other || 0);
    
    return total.toFixed(2);
  };

  // Calculate expense ratios
  const calculateExpenseRatio = (expenseValue) => {
    const effectiveGrossIncome = parseFloat(formik.values.effectiveGrossIncome || 0);
    if (effectiveGrossIncome === 0) return '0.00';
    
    const ratio = (parseFloat(expenseValue || 0) / effectiveGrossIncome) * 100;
    return ratio.toFixed(2);
  };

  // Calculate expense per square foot
  const calculateExpensePerSqFt = (expenseValue) => {
    const buildingSize = parseFloat(formik.values.buildingSize || 0);
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
            name={fieldName('buildingSize')}
            label="Building Size (sq ft)"
            type="number"
            value={values.buildingSize  || ''}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="effectiveGrossIncome"
            name={fieldName('effectiveGrossIncome')}
            label="Effective Gross Income"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.effectiveGrossIncome  || ''}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="expenseYear"
            name={fieldName('expenseYear')}
            label="Expense Year"
            type="number"
            value={formik.values.expenseYear || new Date().getFullYear()}
            onChange={handleChange}
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
                {/* Real Estate Taxes */}
                <TableRow>
                  <TableCell>Real Estate Taxes</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.taxes"
                      name={fieldName('operatingExpenses.taxes')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.taxes  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.taxes)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.taxes)}
                  </TableCell>
                </TableRow>
                
                {/* Insurance */}
                <TableRow>
                  <TableCell>Insurance</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.insurance"
                      name={fieldName('operatingExpenses.insurance')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.insurance  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.insurance)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.insurance)}
                  </TableCell>
                </TableRow>
                
                {/* Utilities */}
                <TableRow>
                  <TableCell>Utilities</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.utilities"
                      name={fieldName('operatingExpenses.utilities')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.utilities  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.utilities)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.utilities)}
                  </TableCell>
                </TableRow>
                
                {/* Repairs & Maintenance */}
                <TableRow>
                  <TableCell>Repairs & Maintenance</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.maintenance"
                      name={fieldName('operatingExpenses.maintenance')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.maintenance  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.maintenance)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.maintenance)}
                  </TableCell>
                </TableRow>
                
                {/* Management */}
                <TableRow>
                  <TableCell>Property Management</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.management"
                      name={fieldName('operatingExpenses.management')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.management  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.management)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.management)}
                  </TableCell>
                </TableRow>
                
                {/* Administrative */}
                <TableRow>
                  <TableCell>Administrative</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.administrative"
                      name={fieldName('operatingExpenses.administrative')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.administrative  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.administrative)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.administrative)}
                  </TableCell>
                </TableRow>
                
                {/* Landscaping */}
                <TableRow>
                  <TableCell>Landscaping & Grounds</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.landscaping"
                      name={fieldName('operatingExpenses.landscaping')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.landscaping  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.landscaping)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.landscaping)}
                  </TableCell>
                </TableRow>
                
                {/* Security */}
                <TableRow>
                  <TableCell>Security</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.security"
                      name={fieldName('operatingExpenses.security')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.security  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.security)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.security)}
                  </TableCell>
                </TableRow>
                
                {/* Cleaning */}
                <TableRow>
                  <TableCell>Cleaning & Janitorial</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.cleaning"
                      name={fieldName('operatingExpenses.cleaning')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.cleaning  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.cleaning)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.cleaning)}
                  </TableCell>
                </TableRow>
                
                {/* Reserves */}
                <TableRow>
                  <TableCell>Reserves for Replacement</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.reserves"
                      name={fieldName('operatingExpenses.reserves')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.reserves  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.reserves)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.reserves)}
                  </TableCell>
                </TableRow>
                
                {/* Other */}
                <TableRow>
                  <TableCell>Other Expenses</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="operatingExpenses.other"
                      name={fieldName('operatingExpenses.other')}
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={values.operatingExpenses?.other  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {calculateExpenseRatio(formik.values.operatingExpenses?.other)}%
                  </TableCell>
                  <TableCell align="right">
                    ${calculateExpensePerSqFt(formik.values.operatingExpenses?.other)}
                  </TableCell>
                </TableRow>
                
                {/* Total Row */}
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Total Operating Expenses</strong></TableCell>
                  <TableCell align="right">
                    <strong>${calculateTotalOpEx()}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      {calculateExpenseRatio(calculateTotalOpEx())}%
                    </strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      ${calculateExpensePerSqFt(calculateTotalOpEx())}
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
              sx={{ minWidth: '200px' }}
              id="netOperatingIncome"
              name={fieldName('netOperatingIncome')}
              disabled
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              value={
                (parseFloat(formik.values.effectiveGrossIncome || 0) - parseFloat(calculateTotalOpEx())).toFixed(2)
              }
            />
          </Box>
        </Grid>
        
        {/* Additional Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="expenseNotes"
            name={fieldName('expenseNotes')}
            label="Expense Notes"
            multiline
            rows={3}
            value={values.expenseNotes  || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OperatingExpenses;
