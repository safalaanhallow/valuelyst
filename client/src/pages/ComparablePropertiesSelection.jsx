import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Grid,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const ComparablePropertiesSelection = () => {
  // Navigation
  const navigate = useNavigate();
  
  // Main state for saved comps
  const [comps, setComps] = useState([]);
  
  // Property selection dialog state
  const [compSelectOpen, setCompSelectOpen] = useState(false);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingCompIndex, setEditingCompIndex] = useState(-1);
  
  // Adjustment state
  const [adjustments, setAdjustments] = useState({
    location: 0,
    size: 0,
    age: 0,
    quality: 0,
    condition: 0,
    other: 0
  });
  
  // Calculation state
  const [adjustedValue, setAdjustedValue] = useState(0);
  const [adjustedCapRate, setAdjustedCapRate] = useState(0);
  
  // Statistics
  const [compStats, setCompStats] = useState({
    avgValue: 0,
    medianValue: 0,
    minValue: 0,
    maxValue: 0,
    avgCapRate: 0,
    minCapRate: 0,
    maxCapRate: 0
  });

  // Sample data - in a real app, this would come from an API
  const sampleComps = [
    { id: 1, name: 'Office Building A', address: '123 Main St', city: 'Denver', propertyType: 'Office', salePrice: 1500000, totalSF: 5000, yearBuilt: 2015, capRate: 5.2 },
    { id: 2, name: 'Retail Center', address: '456 Oak Ave', city: 'Denver', propertyType: 'Retail', salePrice: 1750000, totalSF: 5500, yearBuilt: 2018, capRate: 4.9 },
    { id: 3, name: 'Tech Campus', address: '789 Pine Blvd', city: 'Boulder', propertyType: 'Office', salePrice: 2100000, totalSF: 6200, yearBuilt: 2017, capRate: 4.7 },
    { id: 4, name: 'Warehouse Complex', address: '101 Maple Dr', city: 'Golden', propertyType: 'Industrial', salePrice: 1250000, totalSF: 4800, yearBuilt: 2010, capRate: 5.5 },
    { id: 5, name: 'Mixed-Use Development', address: '202 Cedar Ln', city: 'Denver', propertyType: 'Mixed-Use', salePrice: 1650000, totalSF: 5300, yearBuilt: 2016, capRate: 5.0 }
  ];

  // Load available properties
  useEffect(() => {
    // In a real app, this would be an API call
    setAvailableProperties(sampleComps);
  }, []);

  // Calculate statistics when comps change
  useEffect(() => {
    if (comps.length === 0) return;

    // Calculate values
    const adjustedValues = comps.map(comp => comp.adjustedValue);
    const capRates = comps.map(comp => comp.adjustedCapRate);
    
    // Sort for median calculation
    const sortedValues = [...adjustedValues].sort((a, b) => a - b);
    const medianValue = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)];

    setCompStats({
      avgValue: adjustedValues.reduce((sum, val) => sum + val, 0) / adjustedValues.length,
      medianValue,
      minValue: Math.min(...adjustedValues),
      maxValue: Math.max(...adjustedValues),
      avgCapRate: capRates.reduce((sum, val) => sum + val, 0) / capRates.length,
      minCapRate: Math.min(...capRates),
      maxCapRate: Math.max(...capRates)
    });
  }, [comps]);

  // Calculate adjusted value when property or adjustments change
  useEffect(() => {
    if (!selectedProperty) return;

    const totalAdjustmentPercent = Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val || 0), 0);
    const adjustmentMultiplier = 1 + (totalAdjustmentPercent / 100);
    
    // Calculate adjusted value
    const newAdjustedValue = selectedProperty.salePrice * adjustmentMultiplier;
    setAdjustedValue(newAdjustedValue);
    
    // Adjust cap rate based on quality and condition adjustments
    // Cap rate adjustment uses a different formula - quality and condition have the biggest impact
    const qualityConditionAdjustment = (parseFloat(adjustments.quality || 0) + parseFloat(adjustments.condition || 0)) / 200;
    const newAdjustedCapRate = parseFloat(selectedProperty.capRate) * (1 + qualityConditionAdjustment);
    setAdjustedCapRate(newAdjustedCapRate);
  }, [selectedProperty, adjustments]);

  // Open dialog to add a new comp
  const openAddCompDialog = () => {
    setSelectedProperty(null);
    setAdjustments({
      location: 0,
      size: 0,
      age: 0,
      quality: 0,
      condition: 0,
      other: 0
    });
    setEditingCompIndex(-1);
    setCompSelectOpen(true);
  };

  // Open dialog to edit an existing comp
  const openEditCompDialog = (index) => {
    const comp = comps[index];
    setSelectedProperty(comp.property);
    setAdjustments(comp.adjustments);
    setEditingCompIndex(index);
    setCompSelectOpen(true);
  };

  // Close the comp selection dialog
  const closeCompSelect = () => {
    setCompSelectOpen(false);
  };

  // Handle selection of a property from the dropdown
  const handlePropertySelect = (event) => {
    const propId = event.target.value;
    if (!propId) {
      setSelectedProperty(null);
      return;
    }
    
    const property = availableProperties.find(p => p.id === propId);
    setSelectedProperty(property);
  };

  // Handle adjustment changes
  const handleAdjustmentChange = (e) => {
    const { name, value } = e.target;
    setAdjustments({
      ...adjustments,
      [name]: value
    });
  };

  // Add or update a comp
  const addOrUpdateComp = () => {
    if (!selectedProperty) return;

    const compData = {
      property: selectedProperty,
      adjustments: { ...adjustments },
      adjustedValue: adjustedValue,
      adjustedCapRate: adjustedCapRate
    };

    if (editingCompIndex >= 0) {
      // Update existing comp
      const updatedComps = [...comps];
      updatedComps[editingCompIndex] = compData;
      setComps(updatedComps);
    } else {
      // Add new comp
      setComps([...comps, compData]);
    }

    closeCompSelect();
  };

  // Remove a comp
  const removeComp = (index) => {
    const updatedComps = comps.filter((_, i) => i !== index);
    setComps(updatedComps);
  };

  // Format currency helper
  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const handleContinue = () => {
    // Save the selected comps and adjustments to local storage or state management
    // In a real app, we would also send this data to the server
    localStorage.setItem('valuelytsComps', JSON.stringify(comps));
    
    // Navigate to the next step in the workflow
    navigate('/adjustments');
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        <Typography variant="h4" gutterBottom>
          Comparable Properties Selection
        </Typography>
        <Typography variant="body1" paragraph>
          Add comparable properties and make specific adjustments to each property. The adjusted values will be
          used to determine the valuation range for your subject property.
        </Typography>

        {/* Comp Management Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Selected Comparable Properties
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={openAddCompDialog}
            >
              Add Comparable
            </Button>
          </Box>

          {comps.length === 0 ? (
            <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No comparable properties have been added yet. Click the button above to add your first comparable property.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Original Value</TableCell>
                    <TableCell>Total Adjustments</TableCell>
                    <TableCell>Adjusted Value</TableCell>
                    <TableCell>Cap Rate</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comps.map((comp, index) => {
                    const totalAdjustmentPercent = Object.values(comp.adjustments).reduce((sum, val) => sum + parseFloat(val || 0), 0);
                    return (
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
                        <TableCell>{formatCurrency(comp.property.salePrice)}</TableCell>
                        <TableCell
                          sx={{
                            color: totalAdjustmentPercent > 0 ? 'success.main' : totalAdjustmentPercent < 0 ? 'error.main' : 'text.primary'
                          }}
                        >
                          {totalAdjustmentPercent > 0 ? '+' : ''}{totalAdjustmentPercent}%
                        </TableCell>
                        <TableCell>{formatCurrency(comp.adjustedValue)}</TableCell>
                        <TableCell>{comp.adjustedCapRate.toFixed(2)}%</TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEditCompDialog(index)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton size="small" onClick={() => removeComp(index)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Summary Statistics Section - Only show if we have comps */}
        {comps.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Valuation Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Value Range</Typography>
                    <Typography variant="body2" color="text.secondary">Minimum:</Typography>
                    <Typography variant="body1" color="primary.main">
                      {formatCurrency(compStats.minValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Maximum:</Typography>
                    <Typography variant="body1" color="primary.main">
                      {formatCurrency(compStats.maxValue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Average Values</Typography>
                    <Typography variant="body2" color="text.secondary">Mean Value:</Typography>
                    <Typography variant="body1" color="primary.main">
                      {formatCurrency(compStats.avgValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Median Value:</Typography>
                    <Typography variant="body1" color="primary.main">
                      {formatCurrency(compStats.medianValue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Cap Rate Range</Typography>
                    <Typography variant="body2" color="text.secondary">Range:</Typography>
                    <Typography variant="body1" color="primary.main">
                      {compStats.minCapRate.toFixed(2)}% - {compStats.maxCapRate.toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Average Cap Rate:</Typography>
                    <Typography variant="body1" color="primary.main">
                      {compStats.avgCapRate.toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Dialog for selecting a property and adjusting it */}
        <Dialog open={compSelectOpen} onClose={closeCompSelect} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingCompIndex >= 0 ? 'Edit Comparable Property' : 'Add Comparable Property'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select a Property</InputLabel>
                  <Select
                    value={selectedProperty?.id || ''}
                    onChange={handlePropertySelect}
                    label="Select a Property"
                  >
                    <MenuItem value="">
                      <em>Select a property</em>
                    </MenuItem>
                    {availableProperties.map((prop) => (
                      <MenuItem key={prop.id} value={prop.id}>
                        {prop.name} - {prop.address} ({prop.propertyType})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {selectedProperty && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Property Details</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">Property Type:</Typography>
                        <Typography variant="body1">{selectedProperty.propertyType}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">Total SF:</Typography>
                        <Typography variant="body1">{parseInt(selectedProperty.totalSF).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">Year Built:</Typography>
                        <Typography variant="body1">{selectedProperty.yearBuilt}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">Value:</Typography>
                        <Typography variant="body1">{formatCurrency(selectedProperty.salePrice)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">Cap Rate:</Typography>
                        <Typography variant="body1">{selectedProperty.capRate}%</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Adjustments</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Enter percentage adjustments for each factor. Positive values increase the comparable value, negative values decrease it.
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Location Adjustment"
                          name="location"
                          type="number"
                          value={adjustments.location}
                          onChange={handleAdjustmentChange}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          helperText="Better/worse location than subject"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Size Adjustment"
                          name="size"
                          type="number"
                          value={adjustments.size}
                          onChange={handleAdjustmentChange}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          helperText="Larger/smaller than subject"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Age Adjustment"
                          name="age"
                          type="number"
                          value={adjustments.age}
                          onChange={handleAdjustmentChange}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          helperText="Newer/older than subject"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Quality Adjustment"
                          name="quality"
                          type="number"
                          value={adjustments.quality}
                          onChange={handleAdjustmentChange}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          helperText="Better/worse quality than subject"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Condition Adjustment"
                          name="condition"
                          type="number"
                          value={adjustments.condition}
                          onChange={handleAdjustmentChange}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          helperText="Better/worse condition than subject"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Other Adjustment"
                          name="other"
                          type="number"
                          value={adjustments.other}
                          onChange={handleAdjustmentChange}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          helperText="Other factors (amenities, etc.)"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Adjustment Summary</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Original Value:</Typography>
                            <Typography variant="body1">{formatCurrency(selectedProperty.salePrice)}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Total Adjustment:</Typography>
                            <Typography 
                              variant="body1"
                              color={
                                Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val || 0), 0) > 0 
                                  ? 'success.main' 
                                  : Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val || 0), 0) < 0 
                                    ? 'error.main' 
                                    : 'text.primary'
                              }
                            >
                              {Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val || 0), 0) > 0 ? '+' : ''}
                              {Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val || 0), 0)}%
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Adjusted Value:</Typography>
                            <Typography variant="h6" color="primary.main">
                              {formatCurrency(adjustedValue)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Adjusted Cap Rate:</Typography>
                            <Typography variant="h6" color="primary.main">
                              {adjustedCapRate.toFixed(2)}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeCompSelect}>Cancel</Button>
            <Button 
              onClick={addOrUpdateComp} 
              variant="contained" 
              color="primary"
              disabled={!selectedProperty}
            >
              {editingCompIndex >= 0 ? 'Update' : 'Add'} Comparable
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleContinue}
            disabled={comps.length < 1} // In a real app, would require at least 3 comps
          >
            Continue to Adjustments
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ComparablePropertiesSelection;
