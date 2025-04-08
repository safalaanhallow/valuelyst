import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Box,
  Divider,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  FormControlLabel,
  Switch,
  Collapse,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CalculateOutlined as CalculateIcon,
  InfoOutlined as InfoIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

// Helper function to calculate monthly mortgage payment
const calculateMonthlyPayment = (principal, interestRate, years) => {
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  const x = Math.pow(1 + monthlyRate, numberOfPayments);
  return (principal * monthlyRate * x) / (x - 1);
};

// Helper function to generate amortization schedule
const generateAmortizationSchedule = (loanAmount, interestRate, loanTerm, balloonYear = null) => {
  const schedule = [];
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
  
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  
  // Generate year-by-year summary (not month-by-month to keep it manageable)
  for (let year = 1; year <= loanTerm; year++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    let yearEndingBalance = remainingBalance;
    
    // Calculate 12 months of payments for the year
    for (let month = 1; month <= 12; month++) {
      if ((year - 1) * 12 + month > numberOfPayments) break;
      
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      yearlyInterest += interestPayment;
      yearlyPrincipal += principalPayment;
      yearEndingBalance -= principalPayment;
    }
    
    totalInterestPaid += yearlyInterest;
    totalPrincipalPaid += yearlyPrincipal;
    remainingBalance = yearEndingBalance;
    
    // Handle balloon payment
    let balloonAmount = 0;
    if (balloonYear && year === balloonYear) {
      balloonAmount = remainingBalance;
      remainingBalance = 0;
    }
    
    schedule.push({
      year,
      beginningBalance: remainingBalance + yearlyPrincipal,
      payment: monthlyPayment * 12,
      principal: yearlyPrincipal,
      interest: yearlyInterest,
      endingBalance: remainingBalance,
      balloonAmount
    });
    
    // Stop after balloon payment
    if (balloonAmount > 0) break;
  }
  
  return {
    schedule,
    totalInterestPaid,
    totalPayments: totalPrincipalPaid + totalInterestPaid
  };
};

const DebtStructurePanel = ({ formik }) => {
  const [showAmortization, setShowAmortization] = useState(false);
  const [amortizationSchedule, setAmortizationSchedule] = useState({ schedule: [], totalInterestPaid: 0, totalPayments: 0 });
  
  // Calculate debt service, LTV, and DSCR whenever relevant values change
  useEffect(() => {
    const loanAmount = parseFloat(formik.values.loanAmount) || 0;
    const interestRate = parseFloat(formik.values.interestRate) || 0;
    const loanTerm = parseFloat(formik.values.loanTerm) || 30;
    const amortPeriod = parseFloat(formik.values.amortizationPeriod) || loanTerm;
    const propertyValue = parseFloat(formik.values.propertyValue) || 0;
    const noi = parseFloat(formik.values.netOperatingIncome) || 0;
    const balloonYear = formik.values.balloonPayment ? parseFloat(formik.values.balloonYear) || 0 : null;
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, amortPeriod);
    formik.setFieldValue('monthlyPayment', monthlyPayment, false);
    
    // Calculate annual debt service
    const annualDebtService = monthlyPayment * 12;
    formik.setFieldValue('annualDebtService', annualDebtService, false);
    
    // Calculate loan to value ratio
    const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
    formik.setFieldValue('loanToValue', ltv, false);
    
    // Calculate debt service coverage ratio
    const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;
    formik.setFieldValue('debtServiceCoverageRatio', dscr, false);
    
    // Generate amortization schedule
    const newSchedule = generateAmortizationSchedule(loanAmount, interestRate, loanTerm, balloonYear);
    setAmortizationSchedule(newSchedule);
    
    // Calculate balloon amount if applicable
    if (formik.values.balloonPayment && balloonYear > 0 && balloonYear < loanTerm) {
      const balloonScheduleEntry = newSchedule.schedule.find(entry => entry.year === balloonYear);
      if (balloonScheduleEntry) {
        formik.setFieldValue('balloonAmount', balloonScheduleEntry.balloonAmount, false);
      }
    } else {
      formik.setFieldValue('balloonAmount', 0, false);
    }
  }, [
    formik.values.loanAmount,
    formik.values.interestRate,
    formik.values.loanTerm,
    formik.values.amortizationPeriod,
    formik.values.propertyValue,
    formik.values.netOperatingIncome,
    formik.values.balloonPayment,
    formik.values.balloonYear,
    formik.setFieldValue
  ]);
  
  // Get LTV color based on value
  const getLTVColor = (ltv) => {
    if (ltv <= 60) return 'success.main';
    if (ltv <= 75) return 'warning.main';
    return 'error.main';
  };
  
  // Get DSCR color based on value
  const getDSCRColor = (dscr) => {
    if (dscr >= 1.25) return 'success.main';
    if (dscr >= 1.0) return 'warning.main';
    return 'error.main';
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Debt Structure Analysis
      </Typography>
      
      <Grid container spacing={3}>
        {/* Loan Details Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Loan Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="loanAmount"
                name="loanAmount"
                label="Loan Amount"
                type="number"
                value={formik.values.loanAmount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.loanAmount && Boolean(formik.errors.loanAmount)}
                helperText={formik.touched.loanAmount && formik.errors.loanAmount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="interestRate"
                name="interestRate"
                label="Interest Rate"
                type="number"
                value={formik.values.interestRate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.interestRate && Boolean(formik.errors.interestRate)}
                helperText={formik.touched.interestRate && formik.errors.interestRate}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { step: 0.125, min: 0, max: 25 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="loanTerm"
                name="loanTerm"
                label="Loan Term"
                type="number"
                value={formik.values.loanTerm}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.loanTerm && Boolean(formik.errors.loanTerm)}
                helperText={formik.touched.loanTerm && formik.errors.loanTerm}
                InputProps={{
                  endAdornment: <InputAdornment position="end">years</InputAdornment>,
                  inputProps: { step: 1, min: 1, max: 40 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="amortizationPeriod"
                name="amortizationPeriod"
                label="Amortization Period"
                type="number"
                value={formik.values.amortizationPeriod}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.amortizationPeriod && Boolean(formik.errors.amortizationPeriod)}
                helperText={formik.touched.amortizationPeriod && formik.errors.amortizationPeriod}
                InputProps={{
                  endAdornment: <InputAdornment position="end">years</InputAdornment>,
                  inputProps: { step: 1, min: 1, max: 40 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="propertyValue"
                name="propertyValue"
                label="Property Value"
                type="number"
                value={formik.values.propertyValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.propertyValue && Boolean(formik.errors.propertyValue)}
                helperText={formik.touched.propertyValue && formik.errors.propertyValue}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Balloon Payment Option */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.balloonPayment}
                    onChange={formik.handleChange}
                    name="balloonPayment"
                    color="primary"
                  />
                }
                label="Include Balloon Payment"
              />
              
              <Collapse in={formik.values.balloonPayment} timeout="auto" unmountOnExit>
                <Box sx={{ ml: 3, mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="balloonYear"
                        name="balloonYear"
                        label="Balloon Payment Year"
                        type="number"
                        value={formik.values.balloonYear}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.balloonYear && Boolean(formik.errors.balloonYear)}
                        helperText={formik.touched.balloonYear && formik.errors.balloonYear}
                        InputProps={{
                          inputProps: { min: 1, max: formik.values.loanTerm }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="balloonAmount"
                        name="balloonAmount"
                        label="Balloon Amount"
                        type="number"
                        value={formik.values.balloonAmount}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          readOnly: true,
                          sx: { bgcolor: '#f5f5f5' }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Grid>
            
            {/* Prepayment Penalty Option */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.prepaymentPenalty}
                    onChange={formik.handleChange}
                    name="prepaymentPenalty"
                    color="primary"
                  />
                }
                label="Include Prepayment Penalty"
              />
              
              <Collapse in={formik.values.prepaymentPenalty} timeout="auto" unmountOnExit>
                <Box sx={{ ml: 3, mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="prepaymentYears"
                        name="prepaymentYears"
                        label="Prepayment Penalty Years"
                        type="number"
                        value={formik.values.prepaymentYears}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.prepaymentYears && Boolean(formik.errors.prepaymentYears)}
                        helperText={formik.touched.prepaymentYears && formik.errors.prepaymentYears}
                        InputProps={{
                          inputProps: { min: 1, max: 10 }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="prepaymentPercentage"
                        name="prepaymentPercentage"
                        label="Penalty Percentage"
                        type="number"
                        value={formik.values.prepaymentPercentage}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.prepaymentPercentage && Boolean(formik.errors.prepaymentPercentage)}
                        helperText={formik.touched.prepaymentPercentage && formik.errors.prepaymentPercentage}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          inputProps: { step: 0.1, min: 0, max: 5 }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Loan Metrics Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Loan Metrics
          </Typography>
          
          <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 1, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Monthly Payment
                </Typography>
                <Typography variant="h5" color="primary.main">
                  ${formik.values.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Annual Debt Service
                </Typography>
                <Typography variant="h5" color="primary.main">
                  ${formik.values.annualDebtService.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          {/* LTV Ratio */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">
                Loan To Value (LTV) Ratio
              </Typography>
              <Tooltip title="Lower is better. <60% is considered conservative, >80% is high risk." arrow>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Typography variant="h6" sx={{ mt: 1 }}>
              {formik.values.loanToValue.toFixed(2)}%
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(formik.values.loanToValue, 100)} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getLTVColor(formik.values.loanToValue)
                    }
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">100%</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="success.main">Conservative</Typography>
              <Typography variant="caption" color="warning.main">Standard</Typography>
              <Typography variant="caption" color="error.main">High Risk</Typography>
            </Box>
          </Box>
          
          {/* DSCR */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">
                Debt Service Coverage Ratio (DSCR)
              </Typography>
              <Tooltip title="Higher is better. >1.25x is considered strong, <1.0x means negative cash flow." arrow>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Typography variant="h6" sx={{ mt: 1 }}>
              {formik.values.debtServiceCoverageRatio.toFixed(2)}x
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(formik.values.debtServiceCoverageRatio * 50, 100)} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getDSCRColor(formik.values.debtServiceCoverageRatio)
                    }
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">2.0x</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="error.main">Negative Cash Flow</Typography>
              <Typography variant="caption" color="warning.main">Break-even</Typography>
              <Typography variant="caption" color="success.main">Strong</Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Amortization Schedule Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Amortization Schedule
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={showAmortization ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              onClick={() => setShowAmortization(!showAmortization)}
              size="small"
            >
              {showAmortization ? 'Hide Schedule' : 'Show Schedule'}
            </Button>
          </Box>
          
          <Collapse in={showAmortization} timeout="auto" unmountOnExit>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Year</TableCell>
                    <TableCell align="right">Beginning Balance</TableCell>
                    <TableCell align="right">Payment</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Interest</TableCell>
                    <TableCell align="right">Ending Balance</TableCell>
                    {formik.values.balloonPayment && <TableCell align="right">Balloon Payment</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {amortizationSchedule.schedule.map((row) => (
                    <TableRow key={row.year} sx={row.balloonAmount > 0 ? { bgcolor: '#fff8e1' } : {}}>
                      <TableCell component="th" scope="row">{row.year}</TableCell>
                      <TableCell align="right">
                        ${row.beginningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${row.payment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${row.principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${row.interest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${row.endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      {formik.values.balloonPayment && (
                        <TableCell align="right">
                          ${row.balloonAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                Loan Summary
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Total Principal: ${formik.values.loanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Total Interest: ${amortizationSchedule.totalInterestPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Total Payments: ${amortizationSchedule.totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DebtStructurePanel;
