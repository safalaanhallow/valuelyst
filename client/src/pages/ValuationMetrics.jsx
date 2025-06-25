import React, { useEffect } from 'react';
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

const ValuationMetrics = ({ formik }) => {
  const { values, touched, errors, handleChange, setFieldValue } = formik;

  // Destructure nested values for easier access and to set dependencies for useEffect
  const { netOperatingIncome } = values.expenses;
  const { buildingSize } = values.physicalAttributes;
  const { baseRent, expenseReimbursements, percentageRent, otherIncome } = values.income;
  const { estimatedValue } = values.valuation;

  useEffect(() => {
    const noi = parseFloat(netOperatingIncome) || 0;
    const pgi = (parseFloat(baseRent) || 0) + (parseFloat(expenseReimbursements) || 0) + (parseFloat(percentageRent) || 0) + (parseFloat(otherIncome) || 0);
    const estValue = parseFloat(estimatedValue) || 0;
    const bldgSize = parseFloat(buildingSize) || 0;

    // Calculate and set Cap Rate
    if (estValue > 0) {
      const capRate = (noi / estValue) * 100;
      setFieldValue('valuation.capRate', capRate.toFixed(2));
    } else {
      setFieldValue('valuation.capRate', '0.00');
    }

    // Calculate and set Value Per Square Foot
    if (bldgSize > 0) {
      const pricePerSF = estValue / bldgSize;
      setFieldValue('valuation.valuePerSquareFoot', pricePerSF.toFixed(2));
    } else {
      setFieldValue('valuation.valuePerSquareFoot', '0.00');
    }

    // Calculate and set Gross Rent Multiplier
    if (pgi > 0) {
      const grm = estValue / pgi;
      setFieldValue('valuation.grossRentMultiplier', grm.toFixed(2));
    } else {
      setFieldValue('valuation.grossRentMultiplier', '0.00');
    }

  }, [netOperatingIncome, baseRent, expenseReimbursements, percentageRent, otherIncome, estimatedValue, buildingSize, setFieldValue]);

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
            id="valuation.estimatedValue"
            name="valuation.estimatedValue"
            label="Estimated Property Value"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.valuation.estimatedValue || ''}
            onChange={handleChange}
            error={touched.valuation?.estimatedValue && Boolean(errors.valuation?.estimatedValue)}
            helperText={touched.valuation?.estimatedValue && errors.valuation?.estimatedValue}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="valuation.valuationDate"
            name="valuation.valuationDate"
            label="Valuation Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={values.valuation.valuationDate || ''}
            onChange={handleChange}
            error={touched.valuation?.valuationDate && Boolean(errors.valuation?.valuationDate)}
            helperText={touched.valuation?.valuationDate && errors.valuation?.valuationDate}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="valuation.valuePerSquareFoot"
            name="valuation.valuePerSquareFoot"
            label="Value Per Square Foot"
            InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.valuation.valuePerSquareFoot || '0.00'}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="valuation.capRate"
            name="valuation.capRate"
            label="Capitalization Rate"
            InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            value={values.valuation.capRate || '0.00'}
            error={touched.valuation?.capRate && Boolean(errors.valuation?.capRate)}
            helperText={touched.valuation?.capRate && errors.valuation?.capRate}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="valuation.grossRentMultiplier"
            name="valuation.grossRentMultiplier"
            label="Gross Rent Multiplier"
            InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">x</InputAdornment> }}
            value={values.valuation.grossRentMultiplier || '0.00'}
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
            id="valuation.discountRate"
            name="valuation.discountRate"
            label="Discount Rate (%)"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 30, step: 0.1 }
            }}
            value={values.valuation.discountRate || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="valuation.terminalCapRate"
            name="valuation.terminalCapRate"
            label="Terminal Cap Rate (%)"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 30, step: 0.1 }
            }}
            value={values.valuation.terminalCapRate || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="valuation.holdingPeriod"
            name="valuation.holdingPeriod"
            label="Holding Period (Years)"
            type="number"
            InputProps={{ inputProps: { min: 1, max: 30, step: 1 } }}
            value={values.valuation.holdingPeriod || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="valuation.annualIncomeGrowth"
            name="valuation.annualIncomeGrowth"
            label="Annual Income Growth (%)"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 20, step: 0.1 }
            }}
            value={values.valuation.annualIncomeGrowth || ''}
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
                  <TableCell align="right">${values.valuation.valuePerSquareFoot || '0.00'}</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="valuation.marketMetrics.pricePSF.low"
                      name="valuation.marketMetrics.pricePSF.low"
                      value={values.valuation.marketMetrics?.pricePSF?.low || ''}
                      onChange={handleChange}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="valuation.marketMetrics.pricePSF.average"
                      name="valuation.marketMetrics.pricePSF.average"
                      value={values.valuation.marketMetrics?.pricePSF?.average || ''}
                      onChange={handleChange}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="valuation.marketMetrics.pricePSF.high"
                      name="valuation.marketMetrics.pricePSF.high"
                      value={values.valuation.marketMetrics?.pricePSF?.high || ''}
                      onChange={handleChange}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cap Rate</TableCell>
                  <TableCell align="right">{values.valuation.capRate || '0.00'}%</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="valuation.marketMetrics.capRate.low"
                      name="valuation.marketMetrics.capRate.low"
                      value={values.valuation.marketMetrics?.capRate?.low || ''}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="valuation.marketMetrics.capRate.average"
                      name="valuation.marketMetrics.capRate.average"
                      value={values.valuation.marketMetrics?.capRate?.average || ''}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="valuation.marketMetrics.capRate.high"
                      name="valuation.marketMetrics.capRate.high"
                      value={values.valuation.marketMetrics?.capRate?.high || ''}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Gross Rent Multiplier</TableCell>
                  <TableCell align="right">{values.valuation.grossRentMultiplier || '0.00'}x</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="valuation.marketMetrics.grm.low"
                      name="valuation.marketMetrics.grm.low"
                      value={values.valuation.marketMetrics?.grm?.low || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="valuation.marketMetrics.grm.average"
                      name="valuation.marketMetrics.grm.average"
                      value={values.valuation.marketMetrics?.grm?.average || ''}
                      onChange={handleChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      id="valuation.marketMetrics.grm.high"
                      name="valuation.marketMetrics.grm.high"
                      value={values.valuation.marketMetrics?.grm?.high || ''}
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
            id="valuation.valuationMethods.incomeApproach"
            name="valuation.valuationMethods.incomeApproach"
            label="Income Approach Value"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.valuation.valuationMethods?.incomeApproach || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="valuation.valuationMethods.salesComparison"
            name="valuation.valuationMethods.salesComparison"
            label="Sales Comparison Value"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.valuation.valuationMethods?.salesComparison || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="valuation.valuationMethods.costApproach"
            name="valuation.valuationMethods.costApproach"
            label="Cost Approach Value"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            value={values.valuation.valuationMethods?.costApproach || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Valuation Comments */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="valuation.valuationNotes"
            name="valuation.valuationNotes"
            label="Valuation Notes"
            multiline
            rows={3}
            value={values.valuation.valuationNotes || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ValuationMetrics;
