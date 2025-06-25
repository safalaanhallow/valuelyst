import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { Print as PrintIcon, GetApp as DownloadIcon } from '@mui/icons-material';

const AppraisalReport = ({ appraisal, onPrint, onDownload }) => {
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value) => {
    if (!value || isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  if (!appraisal) return null;

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Commercial Property Appraisal Report
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={onPrint}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
            >
              Download PDF
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Subject Property</Typography>
            <Typography><strong>Property Name:</strong> {appraisal.subject_property.property_name}</Typography>
            <Typography><strong>Address:</strong> {appraisal.subject_property.address}</Typography>
            <Typography><strong>Building Size:</strong> {formatNumber(appraisal.subject_property.building_size)} SF</Typography>
            <Typography><strong>Lot Size:</strong> {formatNumber(appraisal.subject_property.lot_size)} SF</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Report Details</Typography>
            <Typography><strong>Analysis Date:</strong> {new Date(appraisal.analysis_date).toLocaleDateString()}</Typography>
            <Typography><strong>Appraiser:</strong> {appraisal.appraiser.name}</Typography>
            <Typography><strong>Title:</strong> {appraisal.appraiser.title}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Valuation Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Valuation Summary</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Sales Comparison Approach
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography><strong>Average Price:</strong> {formatCurrency(appraisal.valuation_summary.sales_comparison_approach.average_price)}</Typography>
                  <Typography><strong>Median Price:</strong> {formatCurrency(appraisal.valuation_summary.sales_comparison_approach.median_price)}</Typography>
                  <Typography><strong>Average Price/SF:</strong> {formatCurrency(appraisal.valuation_summary.sales_comparison_approach.average_price_per_sf)}</Typography>
                </Box>
                <Typography variant="h6" color="success.main">
                  <strong>Estimated Value: {formatCurrency(appraisal.valuation_summary.sales_comparison_approach.estimated_value)}</strong>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Income Approach
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography><strong>Net Operating Income:</strong> {formatCurrency(appraisal.valuation_summary.income_approach.net_operating_income)}</Typography>
                  <Typography><strong>Market Cap Rate:</strong> {formatPercent(appraisal.valuation_summary.income_approach.market_cap_rate / 100)}</Typography>
                </Box>
                <Typography variant="h6" color="success.main">
                  <strong>Estimated Value: {formatCurrency(appraisal.valuation_summary.income_approach.estimated_value)}</strong>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
          <Typography variant="h5" align="center" color="primary.contrastText">
            <strong>Final Estimated Value: {formatCurrency(appraisal.valuation_summary.final_estimate)}</strong>
          </Typography>
        </Box>
      </Paper>

      {/* Comparable Sales Analysis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Comparable Sales Analysis</Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Sale Price</strong></TableCell>
                <TableCell><strong>Building Size</strong></TableCell>
                <TableCell><strong>Price/SF</strong></TableCell>
                <TableCell><strong>Total Adjustments</strong></TableCell>
                <TableCell><strong>Adjusted Price</strong></TableCell>
                <TableCell><strong>Adjusted Price/SF</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appraisal.comparable_sales.map((comp, index) => (
                <TableRow key={comp.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{comp.property_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sale Date: {comp.sale_date ? new Date(comp.sale_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatCurrency(comp.sale_price)}</TableCell>
                  <TableCell>{formatNumber(comp.building_size)} SF</TableCell>
                  <TableCell>{formatCurrency(comp.price_per_sf)}</TableCell>
                  <TableCell 
                    sx={{ 
                      color: comp.total_adjustment >= 0 ? 'success.main' : 'error.main' 
                    }}
                  >
                    {comp.total_adjustment >= 0 ? '+' : ''}{formatCurrency(comp.total_adjustment)}
                  </TableCell>
                  <TableCell><strong>{formatCurrency(comp.adjusted_price)}</strong></TableCell>
                  <TableCell><strong>{formatCurrency(comp.adjusted_price_per_sf)}</strong></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Adjustments Detail */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Adjustment Details</Typography>
        
        {appraisal.comparable_sales.map((comp, index) => (
          <Box key={comp.id} sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>{comp.property_name}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Size Adjustment</Typography>
                <Typography>{formatCurrency(comp.adjustments?.size_adjustment || 0)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Location Adjustment</Typography>
                <Typography>{formatCurrency(comp.adjustments?.location_adjustment || 0)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Condition Adjustment</Typography>
                <Typography>{formatCurrency(comp.adjustments?.condition_adjustment || 0)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Age Adjustment</Typography>
                <Typography>{formatCurrency(comp.adjustments?.age_adjustment || 0)}</Typography>
              </Grid>
            </Grid>
            {index < appraisal.comparable_sales.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </Paper>

      {/* Methodology */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Valuation Methodology</Typography>
        
        <Typography variant="h6" gutterBottom>Sales Comparison Approach</Typography>
        <Typography paragraph>
          The sales comparison approach estimates value by analyzing recent sales of similar properties 
          and making adjustments for differences in size, location, condition, and other relevant factors. 
          This approach is particularly reliable for commercial properties with an active market.
        </Typography>

        <Typography variant="h6" gutterBottom>Income Approach</Typography>
        <Typography paragraph>
          The income approach estimates value based on the property's income-generating potential. 
          The net operating income (NOI) is divided by a market-derived capitalization rate to 
          determine the property's value as an investment.
        </Typography>

        <Typography variant="h6" gutterBottom>Final Value Conclusion</Typography>
        <Typography paragraph>
          The final estimated value represents a weighted consideration of both approaches, 
          with emphasis placed on the approach most appropriate for this property type and market conditions.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AppraisalReport;
