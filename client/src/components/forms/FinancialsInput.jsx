import React, { useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  Container,
  Paper,
  Tab,
  Typography,
  Grid,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import IncomeStatementGrid from './financials/IncomeStatementGrid';
import ExpenseCalculator from './financials/ExpenseCalculator';
import DebtStructurePanel from './financials/DebtStructurePanel';
import { FinancialsValidationSchema } from './validationSchema';

const FinancialsInput = () => {
  const [activeTab, setActiveTab] = useState('1');

  // Initial values for financial inputs
  const initialValues = {
    // Income Statement fields
    baseRent: 0,
    percentageRent: 0,
    otherIncome: 0,
    expenseRecoveries: 0,
    potentialGrossIncome: 0,
    vacancyRate: 5, // Default 5%
    vacancyLoss: 0,
    effectiveGrossIncome: 0,
    managementFee: 0,
    managementFeePercentage: 3, // Default 3%
    
    // Expense fields
    expenseFrequency: 'annual', // 'annual' or 'monthly'
    propertyTaxes: 0,
    insurance: 0,
    utilities: 0,
    electricExpense: 0,
    gasExpense: 0,
    waterExpense: 0,
    sewerExpense: 0,
    repairsAndMaintenance: 0,
    cleaning: 0,
    landscaping: 0,
    security: 0,
    generalAndAdmin: 0,
    payroll: 0,
    marketing: 0,
    professionalFees: 0,
    reserves: 0,
    otherExpenses: 0,
    totalOperatingExpenses: 0,
    netOperatingIncome: 0,
    
    // Debt Structure fields
    loanAmount: 0,
    interestRate: 4.5, // Default 4.5%
    loanTerm: 30, // Years
    amortizationPeriod: 30, // Years
    monthlyPayment: 0,
    annualDebtService: 0,
    loanToValue: 0, // Calculated
    propertyValue: 0,
    debtServiceCoverageRatio: 0, // Calculated
    prepaymentPenalty: false,
    prepaymentYears: 5,
    prepaymentPercentage: 1, // Default 1%
    balloonPayment: false,
    balloonYear: 10,
    balloonAmount: 0,
  };

  // Handle form submission
  const handleSubmit = (values) => {
    console.log('Financial data submitted:', values);
    // Here you would typically send the data to your backend API
    // axios.post('/api/properties/financials', values);
  };

  // Initialize formik
  const formik = useFormik({
    initialValues,
    validationSchema: FinancialsValidationSchema,
    onSubmit: handleSubmit
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Check if all fields in a tab are valid
  const isTabValid = (tabFields) => {
    if (!formik.dirty) return true; // If form not touched yet
    
    return tabFields.every(field => {
      return !formik.touched[field] || !formik.errors[field];
    });
  };

  // Define fields for each tab for validation indicators
  const tabFields = {
    '1': ['baseRent', 'percentageRent', 'otherIncome', 'expenseRecoveries', 'vacancyRate'],
    '2': ['propertyTaxes', 'insurance', 'utilities', 'repairsAndMaintenance'],
    '3': ['loanAmount', 'interestRate', 'loanTerm', 'amortizationPeriod', 'propertyValue']
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Typography variant="h5" component="h2" gutterBottom>
            Property Financial Analysis
          </Typography>
          
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList 
                onChange={handleTabChange} 
                aria-label="financial input tabs"
                variant="fullWidth"
              >
                <Tab 
                  label="Income Statement" 
                  value="1" 
                  icon={isTabValid(tabFields['1']) ? null : 
                    <Box component="span" sx={{ 
                      bgcolor: 'error.main', 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      ml: 1 
                    }} />} 
                />
                <Tab 
                  label="Expense Calculator" 
                  value="2" 
                  icon={isTabValid(tabFields['2']) ? null : 
                    <Box component="span" sx={{ 
                      bgcolor: 'error.main', 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      ml: 1 
                    }} />} 
                />
                <Tab 
                  label="Debt Structure" 
                  value="3" 
                  icon={isTabValid(tabFields['3']) ? null : 
                    <Box component="span" sx={{ 
                      bgcolor: 'error.main', 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      ml: 1 
                    }} />} 
                />
              </TabList>
            </Box>
            
            <TabPanel value="1">
              <IncomeStatementGrid formik={formik} />
            </TabPanel>
            
            <TabPanel value="2">
              <ExpenseCalculator formik={formik} />
            </TabPanel>
            
            <TabPanel value="3">
              <DebtStructurePanel formik={formik} />
            </TabPanel>
          </TabContext>

          {/* Navigation and Submit Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => {
                const currentTabIndex = parseInt(activeTab);
                if (currentTabIndex > 1) {
                  setActiveTab((currentTabIndex - 1).toString());
                }
              }}
              disabled={activeTab === '1'}
            >
              Previous
            </Button>

            {activeTab !== '3' ? (
              <Button
                variant="contained"
                onClick={() => {
                  const currentTabIndex = parseInt(activeTab);
                  if (currentTabIndex < 3) {
                    setActiveTab((currentTabIndex + 1).toString());
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!formik.isValid || formik.isSubmitting}
              >
                Save Financial Data
              </Button>
            )}
          </Box>
        </form>
      </Paper>
      
      {/* Summary Section - Shows key financial metrics */}
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Financial Summary
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="subtitle2">Effective Gross Income</Typography>
              <Typography variant="h6">
                ${formik.values.effectiveGrossIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="subtitle2">Net Operating Income</Typography>
              <Typography variant="h6">
                ${formik.values.netOperatingIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="subtitle2">Debt Service Coverage Ratio</Typography>
              <Typography variant="h6">
                {formik.values.debtServiceCoverageRatio.toFixed(2)}x
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default FinancialsInput;
