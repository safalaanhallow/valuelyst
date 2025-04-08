import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { createFieldNameHelper, createChangeHandler } from '../utils/formHelpers';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const DebtStructures = ({ formik }) => {
  // Create helper functions for this component
  const fieldName = createFieldNameHelper('debt');
  const handleChange = createChangeHandler(formik);
  
  // Ensure values is initialized
  const values = formik.values || {};
  // Function to add a new loan/debt to the property
  const addDebtItem = () => {
    const debts = [...(formik.values.debtStructures || [])];
    debts.push({
      lender: '',
      loanType: '',
      originalAmount: '',
      currentBalance: '',
      interestRate: '',
      amortizationTerm: '',
      maturityDate: '',
      monthlyPayment: '',
      isInterestOnly: false
    });
    formik.setFieldValue('debtStructures', debts);
  };

  // Function to remove a debt item
  const removeDebtItem = (index) => {
    const debts = [...(formik.values.debtStructures || [])];
    debts.splice(index, 1);
    formik.setFieldValue('debtStructures', debts);
  };

  // Function to handle changes to debt structure fields
  const handleDebtItemChange = (index, field, value) => {
    const debts = [...(formik.values.debtStructures || [])];
    debts[index][field] = value;
    
    // Calculate monthly payment if enough data is available
    if (['currentBalance', 'interestRate', 'amortizationTerm'].includes(field)) {
      const principal = parseFloat(debts[index].currentBalance) || 0;
      const annualRate = parseFloat(debts[index].interestRate) || 0;
      const amortizationMonths = parseFloat(debts[index].amortizationTerm) * 12 || 0;
      const isInterestOnly = debts[index].isInterestOnly;
      
      if (principal > 0 && annualRate > 0 && amortizationMonths > 0 && !isInterestOnly) {
        // Calculate monthly payment using the mortgage payment formula
        const monthlyRate = (annualRate / 100) / 12;
        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, amortizationMonths)) / 
                      (Math.pow(1 + monthlyRate, amortizationMonths) - 1);
        debts[index].monthlyPayment = payment.toFixed(2);
      } else if (principal > 0 && annualRate > 0 && isInterestOnly) {
        // Interest only payment
        const monthlyRate = (annualRate / 100) / 12;
        const payment = principal * monthlyRate;
        debts[index].monthlyPayment = payment.toFixed(2);
      }
    }
    
    // Handle interest-only toggle
    if (field === 'isInterestOnly') {
      const principal = parseFloat(debts[index].currentBalance) || 0;
      const annualRate = parseFloat(debts[index].interestRate) || 0;
      
      if (value && principal > 0 && annualRate > 0) {
        // Interest only payment
        const monthlyRate = (annualRate / 100) / 12;
        const payment = principal * monthlyRate;
        debts[index].monthlyPayment = payment.toFixed(2);
      } else if (!value && principal > 0 && annualRate > 0) {
        const amortizationMonths = parseFloat(debts[index].amortizationTerm) * 12 || 0;
        if (amortizationMonths > 0) {
          // Amortizing payment
          const monthlyRate = (annualRate / 100) / 12;
          const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, amortizationMonths)) / 
                        (Math.pow(1 + monthlyRate, amortizationMonths) - 1);
          debts[index].monthlyPayment = payment.toFixed(2);
        }
      }
    }
    
    formik.setFieldValue('debtStructures', debts);
  };

  // Calculate total debt and debt metrics
  const calculateTotalDebt = () => {
    const debts = formik.values.debtStructures || [];
    return debts.reduce((total, debt) => total + parseFloat(debt.currentBalance || 0), 0).toFixed(2);
  };

  const calculateTotalAnnualDebtService = () => {
    const debts = formik.values.debtStructures || [];
    const monthlyTotal = debts.reduce(
      (total, debt) => total + parseFloat(debt.monthlyPayment || 0), 0
    );
    return (monthlyTotal * 12).toFixed(2);
  };

  const calculateDebtServiceCoverageRatio = () => {
    const noi = parseFloat(formik.values.netOperatingIncome || 0);
    const annualDebtService = parseFloat(calculateTotalAnnualDebtService());
    if (annualDebtService === 0) return 'N/A';
    return (noi / annualDebtService).toFixed(2);
  };

  const calculateLoanToValue = () => {
    const totalDebt = parseFloat(calculateTotalDebt());
    const propertyValue = parseFloat(formik.values.estimatedValue || 0);
    if (propertyValue === 0) return 'N/A';
    return ((totalDebt / propertyValue) * 100).toFixed(2) + '%';
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Debt Structures
      </Typography>
      <Typography variant="body2" paragraph>
        Add details about existing debt and financing on the property.
      </Typography>

      <Grid container spacing={3}>
        {/* Property Value Input */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="estimatedValue"
            name={fieldName('estimatedValue')}
            label="Estimated Property Value"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.estimatedValue  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="netOperatingIncome"
            name={fieldName('netOperatingIncome')}
            label="Net Operating Income (NOI)"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.netOperatingIncome  || ''}
            disabled
          />
        </Grid>

        {/* Debt Structures Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Financing Details
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={addDebtItem}
            >
              Add Loan
            </Button>
          </Box>
          
          {(formik.values.debtStructures || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 2 }}>
              No debt items added. Click "Add Loan" to add property financing details.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Lender</TableCell>
                    <TableCell>Loan Type</TableCell>
                    <TableCell>Current Balance</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Amort. Term (Years)</TableCell>
                    <TableCell>Maturity Date</TableCell>
                    <TableCell>Monthly Payment</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(formik.values.debtStructures || []).map((debt, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={debt.lender || ''}
                          onChange={(e) => handleDebtItemChange(index, 'lender', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={debt.loanType || ''}
                            onChange={(e) => handleDebtItemChange(index, 'loanType', e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value=""><em>Select Type</em></MenuItem>
                            <MenuItem value="conventional">Conventional</MenuItem>
                            <MenuItem value="construction">Construction</MenuItem>
                            <MenuItem value="bridge">Bridge</MenuItem>
                            <MenuItem value="mezzanine">Mezzanine</MenuItem>
                            <MenuItem value="cmbs">CMBS</MenuItem>
                            <MenuItem value="agency">Agency</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                          value={debt.currentBalance || ''}
                          onChange={(e) => handleDebtItemChange(index, 'currentBalance', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                          value={debt.interestRate || ''}
                          onChange={(e) => handleDebtItemChange(index, 'interestRate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={debt.amortizationTerm || ''}
                          onChange={(e) => handleDebtItemChange(index, 'amortizationTerm', e.target.value)}
                          disabled={debt.isInterestOnly}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={debt.maturityDate || ''}
                          onChange={(e) => handleDebtItemChange(index, 'maturityDate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                          value={debt.monthlyPayment || ''}
                          onChange={(e) => handleDebtItemChange(index, 'monthlyPayment', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => removeDebtItem(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>

        {/* Debt Metrics Summary */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Debt Metrics
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Total Debt"
                value={`$${calculateTotalDebt()}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Annual Debt Service"
                value={`$${calculateTotalAnnualDebtService()}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Debt Service Coverage Ratio"
                value={calculateDebtServiceCoverageRatio()}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Loan to Value (LTV)"
                value={calculateLoanToValue()}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Additional Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="debtNotes"
            name={fieldName('debtNotes')}
            label="Debt & Financing Notes"
            multiline
            rows={3}
            value={values.debtNotes  || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DebtStructures;
