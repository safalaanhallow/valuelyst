import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Info as InfoIcon,
  WarningAmber as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';

// Import recharts for visualization
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts';

// Import validation utilities
import PropertyValidation from '../../../../utils/PropertyValidation';

// Import tenant management component
import TenantDetails from '../../../../pages/TenantDetails';

const AnalysisStage = ({ workflow, property, validationResults, onValidate, onUpdate }) => {
  // Core state for comps and valuations
  const [comps, setComps] = useState([]);
  const [valuationData, setValuationData] = useState({
    cap_rate: '',
    terminal_cap_rate: '',
    discount_rate: '',
    estimated_value: '',
    value_per_sf: '',
    holding_period: '10'
  });
  const [capRateStats, setCapRateStats] = useState({
    mean: 0,
    stdDev: 0,
    lowerBound: 0,
    upperBound: 0,
    withinRange: true
  });
  
  // New state for comp selection and adjustments
  const [availableProperties, setAvailableProperties] = useState([]);
  const [compSelectOpen, setCompSelectOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [adjustments, setAdjustments] = useState({
    location: 0,
    size: 0,
    age: 0,
    quality: 0,
    condition: 0,
    other: 0
  });
  const [adjustedValue, setAdjustedValue] = useState(0);
  const [propertyAdjustments, setPropertyAdjustments] = useState([]);
  const [editingCompIndex, setEditingCompIndex] = useState(-1);
  
  // State for tenant management
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [tenantFormik, setTenantFormik] = useState({ values: { tenants: [] } });
  
  // Load comps, valuations, available properties, and calculate statistics on component mount
  useEffect(() => {
    loadComps();
    loadValuationData();
    loadAvailableProperties();
    loadTenants();
  }, []);
  
  // Effect to recalculate statistics when comps or cap rate changes
  useEffect(() => {
    calculateCapRateStats();
  }, [comps, valuationData.cap_rate]);
  
  // Load comps from property data
  const loadComps = () => {
    try {
      if (property && property.comps) {
        const propertyComps = JSON.parse(property.comps);
        if (Array.isArray(propertyComps)) {
          setComps(propertyComps);
        }
      }
      
      // Load adjustments if available
      if (property && property.adjustments) {
        const adjustmentData = JSON.parse(property.adjustments);
        if (Array.isArray(adjustmentData)) {
          setPropertyAdjustments(adjustmentData);
        }
      }
    } catch (error) {
      console.error('Error loading comps and adjustments:', error);
    }
  };
  
  // Load available properties for comparison
  const loadAvailableProperties = async () => {
    try {
      const response = await axios.get('/api/properties');
      // Filter out the current property and sort by name
      const filteredProperties = response.data.filter(p => p.id !== property.id)
        .map(p => ({
          id: p.id,
          name: p.identification?.property_name || `Property #${p.id}`,
          address: p.identification?.address || 'No address',
          propertyType: p.physical?.property_type || 'Unknown',
          totalSF: p.physical?.total_building_sf || 0,
          yearBuilt: p.physical?.year_built || 'Unknown',
          salePrice: p.valuations?.estimated_value || 0,
          capRate: p.valuations?.cap_rate || 0
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
        
      setAvailableProperties(filteredProperties);
    } catch (error) {
      console.error('Error loading available properties:', error);
    }
  };
  
  // Load tenant data from property
  const loadTenants = () => {
    try {
      if (property && property.tenants) {
        // Parse tenants from property data
        const propertyTenants = JSON.parse(property.tenants);
        if (Array.isArray(propertyTenants)) {
          setTenants(propertyTenants);
          setTenantFormik({ values: { tenants: propertyTenants } });
        }
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };
  
  // Load valuation data from property
  const loadValuationData = () => {
    try {
      if (property && property.valuations) {
        const valuations = JSON.parse(property.valuations);
        setValuationData(prev => ({
          ...prev,
          cap_rate: valuations.cap_rate || '',
          terminal_cap_rate: valuations.terminal_cap_rate || '',
          discount_rate: valuations.discount_rate || '',
          estimated_value: valuations.estimated_value || '',
          value_per_sf: valuations.value_per_sf || '',
          holding_period: valuations.holding_period || '10'
        }));
      }
    } catch (error) {
      console.error('Error loading valuation data:', error);
    }
  };
  
  // Calculate cap rate statistics based on comps
  const calculateCapRateStats = () => {
    try {
      // Extract cap rates from comps
      const compCapRates = comps
        .filter(comp => comp.cap_rate && !isNaN(parseFloat(comp.cap_rate)))
        .map(comp => parseFloat(comp.cap_rate));
      
      if (compCapRates.length > 0) {
        // Calculate mean
        const mean = compCapRates.reduce((a, b) => a + b, 0) / compCapRates.length;
        
        // Calculate standard deviation
        const variance = compCapRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / compCapRates.length;
        const stdDev = Math.sqrt(variance);
        
        // Calculate ±2σ range
        const lowerBound = mean - (2 * stdDev);
        const upperBound = mean + (2 * stdDev);
        
        // Check if property cap rate is within range
        const capRate = parseFloat(valuationData.cap_rate);
        const withinRange = !isNaN(capRate) ? (capRate >= lowerBound && capRate <= upperBound) : true;
        
        setCapRateStats({
          mean,
          stdDev,
          lowerBound,
          upperBound,
          withinRange
        });
      }
    } catch (error) {
      console.error('Error calculating cap rate statistics:', error);
    }
  };
  
  // Handle valuation data changes
  const handleValuationChange = (event) => {
    const { name, value } = event.target;
    setValuationData({
      ...valuationData,
      [name]: value
    });
  };
  
  // Calculate value per square foot
  const calculateValuePerSF = () => {
    try {
      const estimatedValue = parseFloat(valuationData.estimated_value);
      if (property && property.physical && !isNaN(estimatedValue)) {
        const physical = JSON.parse(property.physical);
        const totalSF = parseFloat(physical.total_building_sf);
        
        if (!isNaN(totalSF) && totalSF > 0) {
          const valuePerSF = estimatedValue / totalSF;
          setValuationData({
            ...valuationData,
            value_per_sf: valuePerSF.toFixed(2)
          });
        }
      }
    } catch (error) {
      console.error('Error calculating value per SF:', error);
    }
  };
  
  // Handle opening the comp selection dialog
  const openCompSelect = (index = -1) => {
    setCompSelectOpen(true);
    setEditingCompIndex(index);
    
    // If editing an existing comp, load its adjustments
    if (index >= 0 && index < propertyAdjustments.length) {
      setAdjustments(propertyAdjustments[index].adjustments);
      setSelectedProperty(availableProperties.find(p => p.id === propertyAdjustments[index].propertyId) || null);
    } else {
      // Reset for a new comp
      setAdjustments({
        location: 0,
        size: 0,
        age: 0,
        quality: 0,
        condition: 0,
        other: 0
      });
      setSelectedProperty(null);
    }
  };

  // Handle closing the comp selection dialog
  const closeCompSelect = () => {
    setCompSelectOpen(false);
    setSelectedProperty(null);
  };

  // Handle property selection for comparison
  const handlePropertySelect = (event) => {
    const propertyId = event.target.value;
    const selected = availableProperties.find(p => p.id === propertyId);
    setSelectedProperty(selected);
    
    // Calculate adjusted value based on selected property and current adjustments
    if (selected) {
      calculateAdjustedValue(selected, adjustments);
    }
  };

  // Handle adjustment change
  const handleAdjustmentChange = (event) => {
    const { name, value } = event.target;
    const newAdjustments = { ...adjustments, [name]: parseFloat(value) || 0 };
    setAdjustments(newAdjustments);
    
    // Recalculate adjusted value
    if (selectedProperty) {
      calculateAdjustedValue(selectedProperty, newAdjustments);
    }
  };

  // Calculate adjusted value based on property and adjustments
  const calculateAdjustedValue = (property, adjustmentValues) => {
    if (!property) return;
    
    // Start with the property's sale price
    let baseValue = parseFloat(property.salePrice) || 0;
    
    // Calculate total adjustment percentage
    const totalAdjustmentPercent = Object.values(adjustmentValues).reduce((sum, val) => sum + parseFloat(val), 0);
    
    // Apply adjustments
    const adjustedVal = baseValue * (1 + totalAdjustmentPercent / 100);
    setAdjustedValue(adjustedVal);
    
    return adjustedVal;
  };

  // Add or update a comparable property
  const addOrUpdateComp = () => {
    if (!selectedProperty) return;
    
    // Calculate the final adjusted value
    const finalAdjustedValue = calculateAdjustedValue(selectedProperty, adjustments);
    const adjustedCapRate = finalAdjustedValue > 0 ? 
      (parseFloat(selectedProperty.capRate) * (1 + (adjustments.quality + adjustments.condition) / 200)) : 
      parseFloat(selectedProperty.capRate);
    
    // Create the comp object
    const compData = {
      property_id: selectedProperty.id,
      property_name: selectedProperty.name,
      address: selectedProperty.address,
      property_type: selectedProperty.propertyType,
      total_sf: selectedProperty.totalSF,
      year_built: selectedProperty.yearBuilt,
      original_value: parseFloat(selectedProperty.salePrice),
      adjusted_value: finalAdjustedValue,
      cap_rate: adjustedCapRate.toFixed(2),
      adjustment_total: Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val), 0)
    };
    
    // Create adjustment record
    const adjustmentRecord = {
      propertyId: selectedProperty.id,
      compData,
      adjustments: { ...adjustments }
    };
    
    // Update or add to the lists
    if (editingCompIndex >= 0 && editingCompIndex < comps.length) {
      // Update existing
      const updatedComps = [...comps];
      updatedComps[editingCompIndex] = compData;
      setComps(updatedComps);
      
      const updatedAdjustments = [...propertyAdjustments];
      updatedAdjustments[editingCompIndex] = adjustmentRecord;
      setPropertyAdjustments(updatedAdjustments);
    } else {
      // Add new
      setComps([...comps, compData]);
      setPropertyAdjustments([...propertyAdjustments, adjustmentRecord]);
    }
    
    // Close the dialog
    closeCompSelect();
    
    // Save the updated comps and adjustments
    saveCompsAndAdjustments([...comps, compData], [...propertyAdjustments, adjustmentRecord]);
  };

  // Remove a comparable property
  const removeComp = (index) => {
    if (index >= 0 && index < comps.length) {
      const updatedComps = comps.filter((_, i) => i !== index);
      const updatedAdjustments = propertyAdjustments.filter((_, i) => i !== index);
      
      setComps(updatedComps);
      setPropertyAdjustments(updatedAdjustments);
      
      // Save the updated comps and adjustments
      saveCompsAndAdjustments(updatedComps, updatedAdjustments);
    }
  };

  // Save comps and adjustments to the database
  const saveCompsAndAdjustments = async (updatedComps, updatedAdjustments) => {
    try {
      await axios.put(`/api/properties/${property.id}`, {
        comps: JSON.stringify(updatedComps),
        adjustments: JSON.stringify(updatedAdjustments)
      });
      
      // Recalculate cap rate stats
      calculateCapRateStats();
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving comps and adjustments:', error);
    }
  };

  // Save valuation data to property
  const saveValuationData = async () => {
    try {
      // Validate cap rate before saving
      const capRateValidation = PropertyValidation.validateCapRate(valuationData.cap_rate);
      
      if (!capRateValidation.valid) {
        // We're still allowing saves even with invalid data,
        // but we'll show a warning in the UI
        console.warn('Cap rate validation failed:', capRateValidation.message);
      }
      
      await axios.put(`/api/properties/${property.id}`, {
        valuations: JSON.stringify(valuationData)
      });
      
      if (onUpdate) onUpdate();
      if (onValidate) onValidate();
    } catch (error) {
      console.error('Error saving valuation data:', error);
    }
  };
  
  // Save tenant data to property
  const saveTenantData = async (updatedTenants) => {
    try {
      // Save tenants data to property model
      await axios.put(`/api/properties/${property.id}`, {
        tenants: JSON.stringify(updatedTenants)
      });
      
      // Update local state
      setTenants(updatedTenants);
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving tenant data:', error);
    }
  };
  
  // Render cap rate validation alert
  const renderCapRateValidation = () => {
    if (isNaN(parseFloat(valuationData.cap_rate))) {
      return null;
    }
    
    // Check if cap rate is outside the standard 5-15% range
    const capRateValidation = PropertyValidation.validateCapRate(valuationData.cap_rate);
    if (!capRateValidation.valid) {
      return (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2">{capRateValidation.message}</Typography>
          {capRateValidation.details && (
            <Typography variant="body2">{capRateValidation.details}</Typography>
          )}
        </Alert>
      );
    } 
    // Check if cap rate is outside the comp-based 2σ range
    else if (!capRateStats.withinRange) {
      return (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          The selected Cap Rate is outside the ±2σ range of comparable properties.
          Consider adjusting the Cap Rate or providing additional justification.
        </Alert>
      );
    } else {
      return (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
          The selected Cap Rate is within the acceptable range of comparable properties.
        </Alert>
      );
    }
  };
  
  // Prepare data for cap rate comparison chart
  const prepareCapRateChartData = () => {
    const chartData = comps.map(comp => ({
      name: comp.property_name.length > 10 ? comp.property_name.substring(0, 10) + '...' : comp.property_name,
      cap_rate: parseFloat(comp.cap_rate) || 0
    }));
    
    // Add subject property
    if (valuationData.cap_rate) {
      chartData.push({
        name: 'Subject',
        cap_rate: parseFloat(valuationData.cap_rate) || 0,
        isSubject: true
      });
    }
    
    return chartData;
  };
  
  // Helper to format currency
  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };
  
  // Calculate weighted average rent from tenants
  const calculateWeightedAvgRent = () => {
    if (tenants.length === 0) return '0.00';
    
    let totalArea = 0;
    let weightedRentSum = 0;
    
    tenants.forEach(tenant => {
      const area = parseFloat(tenant.squareFeet) || 0;
      const rent = parseFloat(tenant.baseRentPSF) || 0;
      
      totalArea += area;
      weightedRentSum += area * rent;
    });
    
    if (totalArea === 0) return '0.00';
    return (weightedRentSum / totalArea).toFixed(2);
  };
  
  // Edit a tenant
  const editTenant = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      // When editing a single tenant, we create a formik state with just that tenant
      setTenantFormik({ values: { tenants: [tenant] } });
      setTenantDialogOpen(true);
    }
  };
  
  // Remove a tenant
  const removeTenant = async (tenantId) => {
    const updatedTenants = tenants.filter(t => t.id !== tenantId);
    await saveTenantData(updatedTenants);
  };
  
  // Handle tenant form submission
  const handleTenantFormSubmit = async (values) => {
    await saveTenantData(values.tenants);
    setTenantDialogOpen(false);
  };

  // Handle adding a new tenant
  const handleAddTenant = () => {
    // Create a new tenant object with a unique ID
    const newTenantId = tenants.length > 0 ? Math.max(...tenants.map(t => t.id || 0)) + 1 : 1;
    const newTenant = {
      id: newTenantId,
      tenantName: '',
      leaseStart: '',
      leaseExpiry: '',
      squareFeet: '',
      baseRentPSF: '',
      monthlyRent: '',
      annualRent: '',
      securityDeposit: '',
      tiAllowance: '',
      leaseType: '',
      escalationRate: '',
      camCharges: '',
      renewalOptions: [],
      notes: ''
    };
    
    // Set up the formik state with the new tenant
    setTenantFormik({ values: { tenants: [newTenant] } });
    setTenantDialogOpen(true);
  };
  
  return (
    <Box>
      {/* Property Selection Dialog */}
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
                              Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val), 0) > 0 
                                ? 'success.main' 
                                : Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val), 0) < 0 
                                  ? 'error.main' 
                                  : 'text.primary'
                            }
                          >
                            {Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val), 0) > 0 ? '+' : ''}
                            {Object.values(adjustments).reduce((sum, val) => sum + parseFloat(val), 0)}%
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
                            {(parseFloat(selectedProperty.capRate) * (1 + (adjustments.quality + adjustments.condition) / 200)).toFixed(2)}%
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
      <Typography variant="h6" gutterBottom>Analysis Stage</Typography>
      <Typography variant="body2" paragraph>
        Analyze the comparable data and determine the capitalization rate and estimated value for the subject property.
      </Typography>
      
      {validationResults.issues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {validationResults.issues.find(issue => issue.includes('Cap rate')) || 
           'Please complete the valuation analysis to proceed to the next stage.'}
        </Alert>
      )}
      
      {renderCapRateValidation()}
      
      {/* Comparable Properties Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Comparable Properties</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => openCompSelect()}
            >
              Add Comparable
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {comps.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No comparable properties added yet. Click 'Add Comparable' to select properties and make adjustments.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Property Name</TableCell>
                    <TableCell>Property Type</TableCell>
                    <TableCell align="right">Total SF</TableCell>
                    <TableCell align="right">Year Built</TableCell>
                    <TableCell align="right">Original Value</TableCell>
                    <TableCell align="right">Adjustment %</TableCell>
                    <TableCell align="right">Adjusted Value</TableCell>
                    <TableCell align="right">Cap Rate</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comps.map((comp, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Tooltip title={comp.address || 'No address'}>
                          <Typography variant="body2">{comp.property_name}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{comp.property_type}</TableCell>
                      <TableCell align="right">{parseInt(comp.total_sf).toLocaleString()}</TableCell>
                      <TableCell align="right">{comp.year_built}</TableCell>
                      <TableCell align="right">${parseFloat(comp.original_value).toLocaleString()}</TableCell>
                      <TableCell align="right" 
                        sx={{
                          color: comp.adjustment_total > 0 ? 'success.main' : 
                                 comp.adjustment_total < 0 ? 'error.main' : 'text.primary'
                        }}
                      >
                        {comp.adjustment_total > 0 ? '+' : ''}{comp.adjustment_total}%
                      </TableCell>
                      <TableCell align="right">${parseFloat(comp.adjusted_value).toLocaleString()}</TableCell>
                      <TableCell align="right">{comp.cap_rate}%</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openCompSelect(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeComp(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Summary Statistics */}
          {comps.length > 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">Average Adjusted Value:</Typography>
                <Typography variant="body1">
                  ${(comps.reduce((sum, comp) => sum + parseFloat(comp.adjusted_value), 0) / comps.length).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">Average Cap Rate:</Typography>
                <Typography variant="body1">
                  {(comps.reduce((sum, comp) => sum + parseFloat(comp.cap_rate), 0) / comps.length).toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">Price Range:</Typography>
                <Typography variant="body1">
                  ${Math.min(...comps.map(c => parseFloat(c.adjusted_value))).toLocaleString()} - 
                  ${Math.max(...comps.map(c => parseFloat(c.adjusted_value))).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">Cap Rate Range:</Typography>
                <Typography variant="body1">
                  {Math.min(...comps.map(c => parseFloat(c.cap_rate))).toFixed(2)}% - 
                  {Math.max(...comps.map(c => parseFloat(c.cap_rate))).toFixed(2)}%
                </Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
      
      {/* Tenant Management Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Tenant Details</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddTenant}
            >
              Add Tenant
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {tenants.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No tenants added yet. Click 'Add Tenant' to add tenant information.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant Name</TableCell>
                    <TableCell>Leased SF</TableCell>
                    <TableCell align="right">Base Rent (PSF)</TableCell>
                    <TableCell align="right">Annual Rent</TableCell>
                    <TableCell align="right">Lease Start</TableCell>
                    <TableCell align="right">Lease Expiry</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenants.map((tenant, index) => (
                    <TableRow key={index}>
                      <TableCell>{tenant.tenantName || `Tenant ${index + 1}`}</TableCell>
                      <TableCell>{tenant.squareFeet ? `${parseFloat(tenant.squareFeet).toLocaleString()} SF` : '-'}</TableCell>
                      <TableCell align="right">{tenant.baseRentPSF ? `$${tenant.baseRentPSF}` : '-'}</TableCell>
                      <TableCell align="right">{tenant.annualRent ? `$${parseFloat(tenant.annualRent).toLocaleString()}` : '-'}</TableCell>
                      <TableCell align="right">{tenant.leaseStart ? new Date(tenant.leaseStart).toLocaleDateString() : '-'}</TableCell>
                      <TableCell align="right">{tenant.leaseExpiry ? new Date(tenant.leaseExpiry).toLocaleDateString() : '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => editTenant(tenant.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeTenant(tenant.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Summary Statistics */}
          {tenants.length > 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">Total Leased Area:</Typography>
                <Typography variant="body1">
                  {tenants.reduce((sum, t) => sum + (parseFloat(t.squareFeet) || 0), 0).toLocaleString()} SF
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">Average Rent:</Typography>
                <Typography variant="body1">
                  ${calculateWeightedAvgRent()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">Total Annual Rent:</Typography>
                <Typography variant="body1">
                  ${tenants.reduce((sum, t) => sum + (parseFloat(t.annualRent) || 0), 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">Number of Tenants:</Typography>
                <Typography variant="body1">{tenants.length}</Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
      
      <Grid container spacing={3}>
        {/* Cap Rate Analysis Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cap Rate Comparison</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareCapRateChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" />
                    <YAxis label={{ value: 'Cap Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <ChartTooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Bar dataKey="cap_rate" name="Cap Rate" fill="#8884d8" />
                    
                    {/* Reference lines for mean and ±2σ bounds */}
                    {capRateStats.mean > 0 && (
                      <>
                        <ReferenceLine y={capRateStats.mean} stroke="#000" strokeDasharray="3 3" label="Mean" />
                        <ReferenceLine y={capRateStats.lowerBound} stroke="#ff0000" strokeDasharray="3 3" label="-2σ" />
                        <ReferenceLine y={capRateStats.upperBound} stroke="#ff0000" strokeDasharray="3 3" label="+2σ" />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              {/* Cap Rate Statistics */}
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="textSecondary">Mean Cap Rate:</Typography>
                    <Typography variant="body1">{capRateStats.mean.toFixed(2)}%</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="textSecondary">Standard Deviation:</Typography>
                    <Typography variant="body1">±{capRateStats.stdDev.toFixed(2)}%</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="textSecondary">±2σ Range:</Typography>
                    <Typography variant="body1">
                      {capRateStats.lowerBound.toFixed(2)}% - {capRateStats.upperBound.toFixed(2)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="textSecondary">Subject Cap Rate:</Typography>
                    <Typography 
                      variant="body1" 
                      color={!capRateStats.withinRange && valuationData.cap_rate ? 'error.main' : 'success.main'}
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      {valuationData.cap_rate}%
                      {!capRateStats.withinRange && valuationData.cap_rate ? (
                        <Tooltip title="Cap rate is outside the ±2σ range of comparable properties">
                          <WarningIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        </Tooltip>
                      ) : valuationData.cap_rate ? (
                        <Tooltip title="Cap rate is within the acceptable range">
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />
                        </Tooltip>
                      ) : null}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Valuation Form */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Valuation Parameters</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Capitalization Rate"
                    name="cap_rate"
                    value={valuationData.cap_rate}
                    onChange={handleValuationChange}
                    error={!capRateStats.withinRange && valuationData.cap_rate}
                    helperText={!capRateStats.withinRange && valuationData.cap_rate ? 
                      `Value should be between ${capRateStats.lowerBound.toFixed(2)}% and ${capRateStats.upperBound.toFixed(2)}%` : ''}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Terminal Cap Rate"
                    name="terminal_cap_rate"
                    value={valuationData.terminal_cap_rate}
                    onChange={handleValuationChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Discount Rate"
                    name="discount_rate"
                    value={valuationData.discount_rate}
                    onChange={handleValuationChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Holding Period"
                    name="holding_period"
                    type="number"
                    value={valuationData.holding_period}
                    onChange={handleValuationChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">years</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Estimated Value"
                    name="estimated_value"
                    value={valuationData.estimated_value}
                    onChange={handleValuationChange}
                    onBlur={calculateValuePerSF}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Value per SF"
                    name="value_per_sf"
                    value={valuationData.value_per_sf}
                    onChange={handleValuationChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/SF</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<SaveIcon />}
                  onClick={saveValuationData}
                >
                  Save Valuation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Tenant Management Dialog */}
      <Dialog
        open={tenantDialogOpen}
        onClose={() => setTenantDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Manage Tenants
        </DialogTitle>
        <DialogContent dividers>
          <TenantDetails 
            formik={tenantFormik}
            setFormik={setTenantFormik}
            dialogMode={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTenantDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => handleTenantFormSubmit(tenantFormik.values)}
          >
            Save Tenants
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalysisStage;
