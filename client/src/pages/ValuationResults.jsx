import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const ValuationResults = () => {
  // In a real app, this data would come from the previous steps and API calculations
  const valuationData = {
    propertyName: '123 Example Property',
    estimatedValue: 1680000,
    capRate: 5.1,
    pricePerSqFt: 315,
    noi: 85680,
    compsUsed: 3,
    confidenceScore: 87,
    valuationMethods: [
      { name: 'Sales Comparison Approach', value: 1650000, weight: 0.5 },
      { name: 'Income Approach', value: 1710000, weight: 0.4 },
      { name: 'Cost Approach', value: 1690000, weight: 0.1 }
    ],
    adjustmentFactors: {
      location: 1.05,
      size: 0.95,
      age: 1.0,
      condition: 1.1,
      amenities: 1.0
    }
  };

  const handleExportPDF = () => {
    console.log('Exporting PDF report...');
    // This would call a function to generate and download a PDF report
    alert('PDF report would be generated here in the final implementation');
  };

  const navigate = useNavigate();

  const handleSaveValuation = () => {
    console.log('Saving valuation...');
    // This would save the valuation to the database
    alert('Valuation saved to database');
    
    // Redirect to the property dashboard or listing
    navigate('/');
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        <Typography variant="h4" gutterBottom>
          Valuation Results
        </Typography>
        
        <Grid container spacing={4}>
          {/* Key Valuation Results */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Estimated Value
                </Typography>
                <Typography variant="h3">
                  ${valuationData.estimatedValue.toLocaleString()}
                </Typography>
                <Typography variant="subtitle1">
                  Confidence Score: {valuationData.confidenceScore}%
                </Typography>
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">Cap Rate</Typography>
                    <Typography variant="h6">{valuationData.capRate}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">Price per SqFt</Typography>
                    <Typography variant="h6">${valuationData.pricePerSqFt}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">NOI (Annual)</Typography>
                    <Typography variant="h6">${valuationData.noi.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">Comps Used</Typography>
                    <Typography variant="h6">{valuationData.compsUsed}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Valuation Methods Breakdown */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Valuation Methods</Typography>
            <List>
              {valuationData.valuationMethods.map((method, index) => (
                <ListItem key={index} divider={index < valuationData.valuationMethods.length - 1}>
                  <ListItemText 
                    primary={method.name}
                    secondary={`Weight: ${method.weight * 100}%`}
                  />
                  <Typography variant="body1">
                    ${method.value.toLocaleString()}
                  </Typography>
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Adjustment Factors Applied</Typography>
            <Grid container spacing={2}>
              {Object.entries(valuationData.adjustmentFactors).map(([factor, value]) => (
                <Grid item xs={6} sm={4} key={factor}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                        {factor}
                      </Typography>
                      <Typography variant="body1">
                        {value < 1 ? '-' : '+'}{Math.abs((value - 1) * 100).toFixed(0)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined"
            onClick={() => window.history.back()}
          >
            Back to Comparables
          </Button>
          <Box>
            <Button 
              variant="outlined" 
              sx={{ mr: 2 }}
              onClick={handleExportPDF}
            >
              Export PDF Report
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSaveValuation}
            >
              Save Valuation
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ValuationResults;
