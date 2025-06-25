import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppraisal } from '../context/AppraisalContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  AlertTitle,
} from '@mui/material';

const AdjustmentsPage = ({ formik }) => {
  const navigate = useNavigate();
  const { subjectProperty, selectedComps, setSubjectProperty } = useAppraisal();
  const [dataStatus, setDataStatus] = useState('checking'); // 'checking', 'valid', 'missing', 'synced'

  // Safety check and data sync logic
  useEffect(() => {
    const checkAndSyncData = () => {
      // Check if subject property has the required structure
      if (subjectProperty && subjectProperty.identification && 
          subjectProperty.identification.streetAddress) {
        setDataStatus('valid');
        return;
      }

      // If formik data is available and has identification data, sync it
      if (formik && formik.values && formik.values.identification &&
          formik.values.identification.streetAddress) {
        console.log('AdjustmentsPage: Subject property missing, syncing from formik data');
        setSubjectProperty(formik.values);
        setDataStatus('synced');
        return;
      }

      // No valid data found
      setDataStatus('missing');
    };

    checkAndSyncData();
  }, [subjectProperty, formik, setSubjectProperty]);

  const handleProceed = () => {
    navigate('/valuation-results');
  };

  // Safe price getter function - uses raw_data.Price as primary source
  const getPropertyPrice = (property) => {
    return property.rawData?.Price || 
           property.raw_data?.Price || 
           property.salePrice || 
           property.sale_price || 0;
  };

  // Format currency helper
  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Show loading state while checking data
  if (dataStatus === 'checking') {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>Loading property data...</Typography>
      </Paper>
    );
  }

  // Show enhanced error message if data is still missing
  if (dataStatus === 'missing') {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Subject Property Data Missing</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The subject property information is not available. This can happen if:
          </Typography>
          <ul>
            <li>You navigated directly to this page without completing the property identification form</li>
            <li>Your browser session was refreshed and lost the form data</li>
            <li>You skipped required steps in the workflow</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
            <strong>To resolve this issue:</strong>
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Start New Appraisal
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/comparable-properties-selection')}
          >
            Go to Comparable Selection
          </Button>
        </Alert>
      </Paper>
    );
  }

  // Show success message if data was synced
  const showSyncMessage = dataStatus === 'synced';

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Show success message if data was automatically synced */}
      {showSyncMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Property Data Loaded Successfully</AlertTitle>
          <Typography variant="body2">
            Subject property information has been automatically loaded from your form data.
          </Typography>
        </Alert>
      )}

      <Box sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          1. Subject Property
        </Typography>
        {subjectProperty && subjectProperty.identification ? (
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {subjectProperty.identification.streetAddress}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subjectProperty.identification.city}, {subjectProperty.identification.state} {subjectProperty.identification.zipCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              APN: {subjectProperty.identification.apn}
            </Typography>
          </Box>
        ) : (
          <Typography color="error">
            Subject property is not set or has an invalid format. Please start a new appraisal from the beginning to ensure all data is correctly structured.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        2. Review Selected Comparables
      </Typography>
      {selectedComps.length === 0 ? (
        <Typography color="text.secondary" sx={{ my: 2 }}>
          No comparable properties selected. Please go back to the previous step to add comparables.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Sale Price</TableCell>
                <TableCell>Adjusted Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedComps.map((comp, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {comp.property.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {comp.property.address}, {comp.property.city}
                    </Typography>
                  </TableCell>
                  <TableCell>{comp.property.propertyType}</TableCell>
                  <TableCell>{formatCurrency(getPropertyPrice(comp.property))}</TableCell>
                  <TableCell>{formatCurrency(comp.adjustedValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleProceed}
          disabled={!subjectProperty || !subjectProperty.identification || selectedComps.length === 0}
        >
          Proceed to Final Valuation
        </Button>
      </Box>
    </Paper>
  );
};

export default AdjustmentsPage;
