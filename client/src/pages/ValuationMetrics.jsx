import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { createFieldNameHelper, createChangeHandler } from '../utils/formHelpers';

const ValuationMetrics = ({ formik }) => {
  // Create helper functions for this component
  const fieldName = createFieldNameHelper('valuations');
  const handleChange = createChangeHandler(formik);
  
  // Ensure values is initialized
  const values = formik.values || {};
  // Helper function to calculate cap rate
  const calculateCapRate = () => {
    const noi = parseFloat(formik.values.netOperatingIncome || 0);
    const propertyValue = parseFloat(formik.values.estimatedValue || 0);
    if (propertyValue === 0) return 'N/A';
    return ((noi / propertyValue) * 100).toFixed(2) + '%';
  };

  // Helper function to calculate price per square foot
  const calculatePricePerSF = () => {
    const propertyValue = parseFloat(formik.values.estimatedValue || 0);
    const buildingSize = parseFloat(formik.values.buildingSize || 0);
    if (buildingSize === 0) return 'N/A';
    return '$' + (propertyValue / buildingSize).toFixed(2);
  };

  // Helper function to calculate gross rent multiplier
  const calculateGRM = () => {
    const propertyValue = parseFloat(formik.values.estimatedValue || 0);
    const potentialGrossIncome = parseFloat(formik.values.potentialGrossIncome || 0);
    if (potentialGrossIncome === 0) return 'N/A';
    return (propertyValue / potentialGrossIncome).toFixed(2) + 'x';
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Valuation Metrics
      </Typography>
      <Typography variant="body2" paragraph>
        Review and adjust key valuation metrics for the property.
      </Typography>

      <Grid container spacing={3}>
        {/* Current Property Metrics */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Current Property Metrics
          </Typography>
        </Grid>

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
            id="valuationDate"
            name={fieldName('valuationDate')}
            label="Valuation Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={values.valuationDate  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="valuePerSquareFoot"
            label="Value Per Square Foot"
            InputProps={{ readOnly: true }}
            value={calculatePricePerSF()}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="capRate"
            label="Capitalization Rate"
            InputProps={{ readOnly: true }}
            value={calculateCapRate()}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="grossRentMultiplier"
            label="Gross Rent Multiplier"
            InputProps={{ readOnly: true }}
            value={calculateGRM()}
          />
        </Grid>

        {/* Discounted Cash Flow Metrics */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Discounted Cash Flow Analysis
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="discountRate"
            name={fieldName('discountRate')}
            label="Discount Rate (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 30, step: 0.1 }
            }}
            value={values.discountRate  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="terminalCapRate"
            name={fieldName('terminalCapRate')}
            label="Terminal Cap Rate (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 30, step: 0.1 }
            }}
            value={values.terminalCapRate  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="holdingPeriod"
            name={fieldName('holdingPeriod')}
            label="Holding Period (Years)"
            type="number"
            InputProps={{ inputProps: { min: 1, max: 30, step: 1 } }}
            value={values.holdingPeriod  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="annualIncomeGrowth"
            name={fieldName('annualIncomeGrowth')}
            label="Annual Income Growth (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 20, step: 0.1 }
            }}
            value={values.annualIncomeGrowth  || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Market Comparables Summary */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Market Comparables Summary
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell align="right">Subject Property</TableCell>
                  <TableCell align="right">Market Low</TableCell>
                  <TableCell align="right">Market Average</TableCell>
                  <TableCell align="right">Market High</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Price Per SF</TableCell>
                  <TableCell align="right">{calculatePricePerSF()}</TableCell>
                  <TableCell align="right">
                    <TextField 
                      size="small" 
                      id="marketMetrics.pricePSF.low"
                      name={fieldName('marketMetrics.pricePSF.low')}
                      value={values.marketMetrics?.pricePSF?.low  || ''}
                      onChange={handleChange}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField 
                      size="small" 
                      id="marketMetrics.pricePSF.average"
                      name={fieldName('marketMetrics.pricePSF.average')}
                      value={values.marketMetrics?.pricePSF?.average  || ''}
                      onChange={handleChange}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField 
                      size="small" 
                      id="marketMetrics.pricePSF.high"
                      name={fieldName('marketMetrics.pricePSF.high')}
                      value={values.marketMetrics?.pricePSF?.high  || ''}
                      onChange={handleChange}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cap Rate</TableCell>
                  <TableCell align="right">{calculateCapRate()}</TableCell>
                  <TableCell align="right">
                    <TextField 
                      size="small" 
                      id="marketMetrics.capRate.low"
                      name={fieldName('marketMetrics.capRate.low')}
                      value={values.marketMetrics?.capRate?.low  || ''}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField 
                      size="small" 
                      id="marketMetrics.capRate.average"
                      name={fieldName('marketMetrics.capRate.average')}
                      value={values.marketMetrics?.capRate?.average  || ''}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField 
                      size="small" 
                      id="marketMetrics.capRate.high"
                      name={fieldName('marketMetrics.capRate.high')}
                      value={values.marketMetrics?.capRate?.high  || ''}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Gross Rent Multiplier</TableCell>
                  <TableCell align="right">{calculateGRM()}</TableCell>
                  <TableCell align="right">
                    <TextField 
                      size="small" 
                      id="marketMetrics.grm.low"
                      name={fieldName('marketMetrics.grm.low')}
                      value={values.marketMetrics?.grm?.low  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField 
                      size="small" 
                      id="marketMetrics.grm.average"
                      name={fieldName('marketMetrics.grm.average')}
                      value={values.marketMetrics?.grm?.average  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField 
                      size="small" 
                      id="marketMetrics.grm.high"
                      name={fieldName('marketMetrics.grm.high')}
                      value={values.marketMetrics?.grm?.high  || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Valuation Methods
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="valuationMethods.incomeApproach"
            name={fieldName('valuationMethods.incomeApproach')}
            label="Income Approach Value"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.valuationMethods?.incomeApproach  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="valuationMethods.salesComparison"
            name={fieldName('valuationMethods.salesComparison')}
            label="Sales Comparison Value"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.valuationMethods?.salesComparison  || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="valuationMethods.costApproach"
            name={fieldName('valuationMethods.costApproach')}
            label="Cost Approach Value"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.valuationMethods?.costApproach  || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Valuation Comments */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="valuationNotes"
            name={fieldName('valuationNotes')}
            label="Valuation Notes"
            multiline
            rows={3}
            value={values.valuationNotes  || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ValuationMetrics;
