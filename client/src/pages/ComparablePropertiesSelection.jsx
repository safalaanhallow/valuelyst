import React, { useState, useEffect } from 'react';
import { useAppraisal } from '../context/AppraisalContext';
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
  InputAdornment,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import axios from 'axios';
import PropertyDataViewer from '../components/PropertyDataViewer';
import PropertyDetailsModal from '../components/PropertyDetailsModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const ComparablePropertiesSelection = () => {
  // Navigation
  const navigate = useNavigate();
  
  // Global state for comps from context
  const { selectedComps, addComparable: addComp, removeComparable: removeCompFromContext } = useAppraisal();
  
  // Property selection dialog state
  const [compSelectOpen, setCompSelectOpen] = useState(false);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingCompIndex, setEditingCompIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  // State management
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [propertyDetailsModalOpen, setPropertyDetailsModalOpen] = useState(false);
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState(null);

  // Safe price getter function - uses raw_data.Price as primary source
  const getPropertyPrice = (property) => {
    return property.rawData?.Price || 
           property.raw_data?.Price || 
           property.salePrice || 
           property.sale_price || 0;
  };

  // Load available properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/properties/comps/available');
        // Map backend response to frontend expected format
        const mappedProperties = response.data.comps.map(prop => ({
          id: prop.id,
          propertyId: prop.property_id || '',
          taxId: prop.tax_id || '',
          name: prop.property_name || `Property ${prop.id}`,
          address: prop.address || 'Address not available',
          city: prop.city || 'Unknown',
          propertyType: prop.property_type || 'Commercial',
          salePrice: getPropertyPrice(prop), // Use the safe price getter
          totalSF: prop.building_size || 0,
          yearBuilt: prop.year_built || 'Unknown',
          capRate: ((prop.annual_net_income || 0) / (getPropertyPrice(prop) || 1) * 100) || 5.0,
          rawData: prop.raw_data || {} // Include the raw data from the backend
        }));
        setAvailableProperties(mappedProperties);
      } catch (error) {
        console.error('Error fetching available comps:', error);
        setError('Failed to load available comparable properties. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Calculate statistics when comps change
  useEffect(() => {
    if (selectedComps.length === 0) {
      setCompStats({
        avgValue: 0, medianValue: 0, minValue: 0, maxValue: 0,
        avgCapRate: 0, minCapRate: 0, maxCapRate: 0
      });
      return;
    }

    // Calculate values
    const adjustedValues = selectedComps.map(comp => comp.adjustedValue);
    const capRates = selectedComps.map(comp => comp.adjustedCapRate);
    
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
  }, [selectedComps]);

  // Calculate adjusted value when property or adjustments change
  useEffect(() => {
    if (!selectedProperty) return;

    const totalAdjustmentPercent = Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val || 0), 0);
    const adjustmentMultiplier = 1 + (totalAdjustmentPercent / 100);
    
    // Calculate adjusted value
    const newAdjustedValue = getPropertyPrice(selectedProperty) * adjustmentMultiplier;
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
    const comp = selectedComps[index];
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
      // To update, we first remove the old one and then add the new one.
      removeCompFromContext(editingCompIndex);
      addComp(compData);
    } else {
      // Add new comp to the global state
      addComp(compData);
    }

    closeCompSelect();
  };

  // Renamed the context remove function to avoid conflict with the local function name
  const removeComp = (index) => {
    removeCompFromContext(index);
  };

  // Format currency helper
  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const handleContinue = () => {
    // Save the selected comps and adjustments to local storage or state management
    // In a real app, we would also send this data to the server
    // Data is now in the global context, no need to save to localStorage here.
    
    // Navigate to the next step in the workflow
    navigate('/adjustments');
  };

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const handleOpenPropertyDetailsModal = (property) => {
    setSelectedPropertyForModal(property);
    setPropertyDetailsModalOpen(true);
  };

  const handleClosePropertyDetailsModal = () => {
    setPropertyDetailsModalOpen(false);
  };

  return (
    <Container maxWidth="lg">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
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
              <Box>
                <Typography variant="h5">
                  Selected Comparable Properties
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedComps.length} of 3 required comparables selected
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={openAddCompDialog}
                disabled={selectedComps.length >= 5} // Optional: limit to max 5 comparables
              >
                Add Comparable
              </Button>
            </Box>

            {selectedComps.length === 0 ? (
              <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No comparable properties have been added yet. You need at least 3 comparable properties to proceed with the valuation.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Click the button above to add your first comparable property.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="40px"></TableCell>
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
                    {selectedComps.map((comp, index) => {
                      const totalAdjustmentPercent = Object.values(comp.adjustments).reduce((sum, val) => sum + parseFloat(val || 0), 0);
                      return (
                        <React.Fragment key={index}>
                          <TableRow>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                onClick={() => toggleExpanded(index)}
                              >
                                {expandedRows.has(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {comp.property.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {comp.property.address}, {comp.property.city}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  <Chip 
                                    label={`${Object.keys(comp.property.rawData || {}).length} data points`} 
                                    size="small" 
                                    variant="outlined" 
                                    clickable
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent row expansion
                                      handleOpenPropertyDetailsModal(comp.property);
                                    }}
                                    icon={<VisibilityIcon />}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{comp.property.propertyType}</TableCell>
                            <TableCell>{formatCurrency(getPropertyPrice(comp.property))}</TableCell>
                            <TableCell
                              sx={{
                                color: totalAdjustmentPercent > 0 ? 'success.main' : totalAdjustmentPercent < 0 ? 'error.main' : 'text.primary'
                              }}
                            >
                              {totalAdjustmentPercent > 0 ? '+' : ''}{totalAdjustmentPercent}%
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(comp.adjustedValue)}
                            </TableCell>
                            <TableCell>{comp.adjustedCapRate?.toFixed(2)}%</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit Adjustments">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => openEditCompDialog(index)}
                                    color="primary"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove Comparable">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => removeComp(index)}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View Property Details">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenPropertyDetailsModal(comp.property)}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded Row with Full Property Data */}
                          <TableRow>
                            <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                              <Collapse in={expandedRows.has(index)} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
                                  <PropertyDataViewer 
                                    property={comp.property} 
                                    expanded={true}
                                    showSearch={true}
                                    maxHeight="500px"
                                  />
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Summary Statistics Section - Only show if we have comps */}
          {selectedComps.length > 0 && (
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
                  <Typography variant="h6" gutterBottom>
                    Select a Property
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Choose from {availableProperties.length} available comparable properties. Click on a property to view all details.
                  </Typography>
                  
                  {/* Property Selection List */}
                  <Box sx={{ maxHeight: '400px', overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <List disablePadding>
                      {availableProperties.map((prop) => (
                        <React.Fragment key={prop.id}>
                          <ListItem disablePadding>
                            <ListItemButton
                              selected={selectedProperty?.id === prop.id}
                              onClick={() => handlePropertySelect({ target: { value: prop.id } })}
                              sx={{ 
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                '&.Mui-selected': {
                                  backgroundColor: 'primary.light',
                                  color: 'primary.contrastText',
                                  '&:hover': {
                                    backgroundColor: 'primary.main',
                                  }
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', p: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {prop.name} {prop.propertyId && `(ID: ${prop.propertyId})`}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {prop.address ? `${prop.address}, ${prop.city}` : 'Address not available'}
                                    {prop.taxId && ` • Tax ID: ${prop.taxId}`}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip label={prop.propertyType} size="small" variant="outlined" />
                                    <Chip 
                                      label={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(getPropertyPrice(prop) || 0)}
                                      size="small" 
                                      color="primary" 
                                    />
                                    {prop.totalSF && (
                                      <Chip 
                                        label={`${(prop.totalSF || 0).toLocaleString()} SF`} 
                                        size="small" 
                                        variant="outlined" 
                                      />
                                    )}
                                    <Chip 
                                      label={`${Object.keys(prop.rawData || {}).length} data points`} 
                                      size="small" 
                                      variant="outlined" 
                                      clickable
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent row selection
                                        handleOpenPropertyDetailsModal(prop);
                                      }}
                                      icon={<VisibilityIcon />}
                                    />
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {selectedProperty?.id === prop.id && (
                                    <Chip label="Selected" color="primary" size="small" />
                                  )}
                                  <IconButton size="small">
                                    <VisibilityIcon />
                                  </IconButton>
                                </Box>
                              </Box>
                            </ListItemButton>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                </Grid>

                {/* Property Details Section - Show when property is selected */}
                {selectedProperty && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Property Details
                    </Typography>
                    <PropertyDataViewer 
                      property={selectedProperty} 
                      expanded={true}
                      showSearch={true}
                      maxHeight="400px"
                    />
                  </Grid>
                )}
                
                {selectedProperty && (
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
                )}
                
                {selectedProperty && (
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

          <PropertyDetailsModal 
            open={propertyDetailsModalOpen} 
            onClose={handleClosePropertyDetailsModal} 
            property={selectedPropertyForModal} 
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            {selectedComps.length < 3 && (
              <Alert severity="warning" sx={{ mr: 2, flexGrow: 1 }}>
                You need to select at least 3 comparable properties to continue. Currently selected: {selectedComps.length}/3
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinue}
              disabled={selectedComps.length < 3}
              sx={{ minWidth: 200 }}
            >
              Continue to Adjustments ({selectedComps.length}/3)
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default ComparablePropertiesSelection;
