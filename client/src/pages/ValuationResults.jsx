import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppraisal } from '../context/AppraisalContext'; // Import useAppraisal
import {
  Box,
  CircularProgress,
  Typography,
  Grid,
  Paper,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

// Helper to format currency
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const ValuationResults = () => {
  const [valuationData, setValuationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { subjectProperty, selectedComps } = useAppraisal(); // Use context

  useEffect(() => {
    if (!subjectProperty || !selectedComps || selectedComps.length === 0) {
      setError('No subject property or comparables selected. Please start a new appraisal.');
      setLoading(false);
      return;
    }

    const generateValuation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Structure the payload according to backend expectations
        const payload = {
          propertyId: subjectProperty.id,
          selectedCompIds: selectedComps.map(c => c.property.id), // Correctly map comp IDs
          subjectPropertyData: subjectProperty, // Send full subject property data
          adjustments: selectedComps.reduce((acc, comp) => {
            acc[comp.property.id] = comp.adjustments || {};
            return acc;
          }, {})
        };

        const response = await axios.post('/api/properties/appraisal/generate', payload);

        if (response.data.error) {
          setError(response.data.message || 'An error occurred during valuation.');
          setValuationData(null);
        } else {
          setValuationData(response.data);
        }
      } catch (err) {
        console.error('Valuation API Error:', err);
        setError(err.response?.data?.message || 'A server error occurred. Please try again.');
        setValuationData(null);
      } finally {
        setLoading(false);
      }
    };

    generateValuation();
  }, [subjectProperty, selectedComps]);

  const renderValuationDetails = () => {
    if (!valuationData || !valuationData.valuation) return null;
    const { valuation } = valuationData;
    const { finalValue, confidenceScore, capRate, pricePerSqFt, methods, adjustments } = valuation;

    return (
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Estimated Value
        </Typography>
        <Typography variant="h2" align="center" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
          {formatCurrency(finalValue)}
        </Typography>
        <Grid container justifyContent="center" spacing={2} sx={{ mb: 4 }}>
          <Grid item>
            <Typography variant="subtitle1" align="center">
              Confidence Score: <strong>{confidenceScore}%</strong>
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1" align="center">
              Cap Rate: <strong>{capRate.toFixed(1)}%</strong>
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1" align="center">
              Price per SqFt: <strong>{formatCurrency(pricePerSqFt)}</strong>
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Valuation Methods</Typography>
            <List dense>
              {methods.map(method => (
                <ListItem key={method.name}>
                  <ListItemText
                    primary={method.name}
                    secondary={`Weight: ${method.weight}%`}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(method.value)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Key Adjustments</Typography>
            <List dense>
              {adjustments.map(adj => (
                <ListItem key={adj.factor}>
                  <ListItemIcon>
                    {adj.adjustment >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={adj.factor.charAt(0).toUpperCase() + adj.factor.slice(1)}
                  />
                  <Typography variant="body1" color={adj.adjustment >= 0 ? 'success.main' : 'error.main'}>
                    {adj.adjustment >= 0 ? '+' : ''}{adj.adjustment}%
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h3" gutterBottom>Valuation Results</Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Generating your comprehensive valuation report...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          <Typography gutterBottom><strong>Valuation Failed</strong></Typography>
          <Typography>{error}</Typography>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Start New Appraisal
          </Button>
        </Alert>
      )}

      {!loading && !error && valuationData && renderValuationDetails()}
      
      {!loading && !error && !valuationData && (
         <Alert severity="info" sx={{ mt: 3 }}>
          <Typography>No valuation data to display.</Typography>
           <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Start New Appraisal
          </Button>
        </Alert>
      )}
    </Box>
  );
};

export default ValuationResults;
