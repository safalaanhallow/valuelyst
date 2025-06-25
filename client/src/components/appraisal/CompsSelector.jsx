import React, { useState, useEffect } from 'react';
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
  Checkbox,
  Button,
  Alert,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const CompsSelector = ({ propertyId, onCompsSelected }) => {
  const [availableComps, setAvailableComps] = useState([]);
  const [selectedComps, setSelectedComps] = useState([]);
  const [adjustments, setAdjustments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableComps();
  }, []);

  const fetchAvailableComps = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/properties/comps/available');
      setAvailableComps(response.data.comps || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching available comps:', error);
      setError('Failed to load available comparable properties');
      setLoading(false);
    }
  };

  const handleCompSelection = (compId, isSelected) => {
    if (isSelected) {
      if (selectedComps.length >= 4) {
        setError('You can select a maximum of 4 comparable properties');
        return;
      }
      setSelectedComps([...selectedComps, compId]);
    } else {
      setSelectedComps(selectedComps.filter(id => id !== compId));
      // Remove adjustments for deselected comp
      const newAdjustments = { ...adjustments };
      delete newAdjustments[compId];
      setAdjustments(newAdjustments);
    }
    setError(null);
  };

  const handleAdjustmentChange = (compId, adjustmentType, value) => {
    setAdjustments(prev => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        [adjustmentType]: value
      }
    }));
  };

  const handleSubmit = () => {
    if (selectedComps.length < 3) {
      setError('Please select at least 3 comparable properties');
      return;
    }

    onCompsSelected({
      selectedCompIds: selectedComps,
      adjustments: adjustments
    });
  };

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Comparable Properties
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select 3-4 comparable properties from the available sales data to use in the appraisal analysis.
        You can also make adjustments for differences between the subject property and comparables.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">Select</TableCell>
                <TableCell>Property Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Sale Price</TableCell>
                <TableCell>Building Size</TableCell>
                <TableCell>Price/SF</TableCell>
                <TableCell>Sale Date</TableCell>
                <TableCell>Cap Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableComps.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedComps.includes(comp.id)}
                      onChange={(e) => handleCompSelection(comp.id, e.target.checked)}
                      disabled={!selectedComps.includes(comp.id) && selectedComps.length >= 4}
                    />
                  </TableCell>
                  <TableCell>{comp.property_name}</TableCell>
                  <TableCell>
                    {comp.address}
                    {comp.city && `, ${comp.city}`}
                    {comp.state && `, ${comp.state}`}
                  </TableCell>
                  <TableCell>{formatCurrency(comp.sale_price)}</TableCell>
                  <TableCell>{formatNumber(comp.building_size)} SF</TableCell>
                  <TableCell>{formatCurrency(comp.price_per_sf)}</TableCell>
                  <TableCell>{comp.sale_date ? new Date(comp.sale_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{comp.cap_rate ? `${comp.cap_rate}%` : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedComps.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Adjustments for Selected Comparables
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Make adjustments to account for differences between the subject property and comparables.
            Enter positive values to increase comp value, negative to decrease.
          </Typography>

          {selectedComps.map((compId) => {
            const comp = availableComps.find(c => c.id === compId);
            if (!comp) return null;

            return (
              <Box key={compId} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {comp.property_name}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Size Adjustment ($)"
                      type="number"
                      value={adjustments[compId]?.size_adjustment || ''}
                      onChange={(e) => handleAdjustmentChange(compId, 'size_adjustment', e.target.value)}
                      helperText="Adjust for size differences"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Location Adjustment ($)"
                      type="number"
                      value={adjustments[compId]?.location_adjustment || ''}
                      onChange={(e) => handleAdjustmentChange(compId, 'location_adjustment', e.target.value)}
                      helperText="Adjust for location differences"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Condition Adjustment ($)"
                      type="number"
                      value={adjustments[compId]?.condition_adjustment || ''}
                      onChange={(e) => handleAdjustmentChange(compId, 'condition_adjustment', e.target.value)}
                      helperText="Adjust for condition differences"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Age Adjustment ($)"
                      type="number"
                      value={adjustments[compId]?.age_adjustment || ''}
                      onChange={(e) => handleAdjustmentChange(compId, 'age_adjustment', e.target.value)}
                      helperText="Adjust for age/construction differences"
                    />
                  </Grid>
                </Grid>
              </Box>
            );
          })}
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Chip 
          label={`${selectedComps.length}/4 properties selected`}
          color={selectedComps.length >= 3 ? 'success' : 'default'}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={selectedComps.length < 3}
        >
          Generate Appraisal
        </Button>
      </Box>
    </Box>
  );
};

export default CompsSelector;
