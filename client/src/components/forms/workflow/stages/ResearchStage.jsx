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
  Slider,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Import validation utilities
import PropertyValidation from '../../../../utils/PropertyValidation';
import axios from 'axios';

const ResearchStage = ({ workflow, property, validationResults, onValidate, onUpdate }) => {
  const [comps, setComps] = useState([]);
  const [adjustmentFactors, setAdjustmentFactors] = useState({
    location: { weight: 25, description: 'Location quality relative to subject' },
    size: { weight: 15, description: 'Building size adjustment' },
    age: { weight: 15, description: 'Building age and condition' },
    quality: { weight: 20, description: 'Building quality and features' },
    access: { weight: 10, description: 'Accessibility and visibility' },
    parking: { weight: 5, description: 'Parking ratio and quality' },
    tenancy: { weight: 10, description: 'Tenant mix and credit quality' }
  });
  const [adjustments, setAdjustments] = useState({});
  const [editingAdjustment, setEditingAdjustment] = useState(null);
  const [propertyData, setPropertyData] = useState({
    physical: {},
    environmental: {},
    identification: {},
    tenants: []
  });
  const [validationErrors, setValidationErrors] = useState({
    rentableArea: { valid: true },
    floodZone: { valid: true },
    tenantRents: []
  });
  
  // Load comps, adjustments, and property data on component mount
  useEffect(() => {
    loadComps();
    loadAdjustments();
    loadPropertyData();
  }, []);
  
  // Load comps from property data
  const loadComps = () => {
    try {
      if (property && property.comps) {
        const propertyComps = JSON.parse(property.comps);
        if (Array.isArray(propertyComps)) {
          setComps(propertyComps);
        }
      }
    } catch (error) {
      console.error('Error loading comps:', error);
    }
  };
  
  // Load adjustments from property data
  const loadAdjustments = () => {
    try {
      if (property && property.adjustments) {
        const propertyAdjustments = JSON.parse(property.adjustments);
        
        // Load adjustment factors if they exist
        if (propertyAdjustments.factors) {
          setAdjustmentFactors(propertyAdjustments.factors);
        }
        
        // Load comp-specific adjustments if they exist
        if (propertyAdjustments.compAdjustments) {
          setAdjustments(propertyAdjustments.compAdjustments);
        } else {
          // Initialize blank adjustments for each comp
          initializeAdjustments();
        }
      } else {
        // Initialize blank adjustments for each comp
        initializeAdjustments();
      }
    } catch (error) {
      console.error('Error loading adjustments:', error);
      initializeAdjustments();
    }
  };
  
  // Initialize adjustments for each comp
  const initializeAdjustments = () => {
    const newAdjustments = {};
    
    comps.forEach(comp => {
      newAdjustments[comp.id] = {};
      
      Object.keys(adjustmentFactors).forEach(factor => {
        newAdjustments[comp.id][factor] = 0; // No adjustment initially
      });
    });
    
    setAdjustments(newAdjustments);
  };
  
  // Handle adjustment factor weight change
  const handleFactorWeightChange = (factor, newWeight) => {
    setAdjustmentFactors({
      ...adjustmentFactors,
      [factor]: {
        ...adjustmentFactors[factor],
        weight: newWeight
      }
    });
  };
  
  // Handle comp-specific adjustment change
  const handleAdjustmentChange = (compId, factor, value) => {
    const updatedValue = Math.min(Math.max(value, -50), 50); // Limit to -50% to +50%
    
    setAdjustments({
      ...adjustments,
      [compId]: {
        ...adjustments[compId],
        [factor]: updatedValue
      }
    });
  };
  
  // Start editing an adjustment
  const startEditingAdjustment = (compId, factor) => {
    setEditingAdjustment({ compId, factor });
  };
  
  // Cancel editing
  const cancelEditingAdjustment = () => {
    setEditingAdjustment(null);
  };
  
  // Load property data from property object
  const loadPropertyData = () => {
    try {
      if (property) {
        const physicalData = property.physical ? JSON.parse(property.physical) : {};
        const environmentalData = property.environmental ? JSON.parse(property.environmental) : {};
        const identificationData = property.identification ? JSON.parse(property.identification) : {};
        const tenantsData = property.tenants ? JSON.parse(property.tenants) : [];
        
        setPropertyData({
          physical: physicalData,
          environmental: environmentalData,
          identification: identificationData,
          tenants: tenantsData
        });
        
        // Validate data after loading
        validatePropertyData(physicalData, environmentalData, identificationData, tenantsData);
      }
    } catch (error) {
      console.error('Error loading property data:', error);
    }
  };
  
  // Validate property data using validation utilities
  const validatePropertyData = (physical, environmental, identification, tenants) => {
    const validationResults = {
      rentableArea: PropertyValidation.validateRentableArea(
        physical.total_rentable_area,
        physical.occupied_space
      ),
      floodZone: PropertyValidation.validateFloodZone(
        environmental.flood_zone,
        environmental.phase_i_report_date
      ),
      tenantRents: []
    };
    
    // Validate tenant rents if tenants exist
    if (Array.isArray(tenants)) {
      tenants.forEach((tenant, index) => {
        const result = PropertyValidation.validateTenantRent(
          tenant.psf_rent,
          identification.property_type
        );
        
        if (!result.valid) {
          validationResults.tenantRents.push({
            ...result,
            tenantIndex: index,
            tenantName: tenant.tenant_name || `Tenant ${index + 1}`
          });
        }
      });
    }
    
    setValidationErrors(validationResults);
    return validationResults;
  };
  
  // Render validation alerts
  const renderValidationAlerts = () => {
    const alerts = [];
    
    // Net Rentable Area validation
    if (!validationErrors.rentableArea.valid) {
      alerts.push(
        <Alert 
          key="rentableArea" 
          severity="error" 
          icon={<ErrorIcon />} 
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2">{validationErrors.rentableArea.message}</Typography>
        </Alert>
      );
    }
    
    // Flood Zone validation
    if (!validationErrors.floodZone.valid) {
      alerts.push(
        <Alert 
          key="floodZone" 
          severity="error" 
          icon={<ErrorIcon />} 
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2">{validationErrors.floodZone.message}</Typography>
          {validationErrors.floodZone.details && (
            <Typography variant="body2">{validationErrors.floodZone.details}</Typography>
          )}
        </Alert>
      );
    }
    
    // Tenant PSF Rent validation
    if (validationErrors.tenantRents.length > 0) {
      alerts.push(
        <Alert 
          key="tenantRents" 
          severity="error" 
          icon={<ErrorIcon />} 
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2">Some tenant rents exceed maximum market rates:</Typography>
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            {validationErrors.tenantRents.map((error, index) => (
              <li key={index}>
                <Typography variant="body2">
                  {error.tenantName}: {error.message}
                </Typography>
              </li>
            ))}
          </ul>
        </Alert>
      );
    }
    
    return alerts.length > 0 ? alerts : null;
  };
  
  // Save all adjustments to property
  const saveAdjustments = async () => {
    try {
      const adjustmentData = {
        factors: adjustmentFactors,
        compAdjustments: adjustments
      };
      
      await axios.put(`/api/properties/${property.id}`, {
        adjustments: JSON.stringify(adjustmentData)
      });
      
      // Revalidate property data after saving
      validatePropertyData(
        propertyData.physical,
        propertyData.environmental,
        propertyData.identification,
        propertyData.tenants
      );
      
      if (onUpdate) onUpdate();
      if (onValidate) onValidate();
      
      setEditingAdjustment(null);
    } catch (error) {
      console.error('Error saving adjustments:', error);
    }
  };
  
  // Calculate adjusted value for a comp
  const calculateAdjustedValue = (comp) => {
    try {
      if (!adjustments[comp.id]) return parseFloat(comp.price);
      
      let adjustmentTotal = 0;
      Object.keys(adjustmentFactors).forEach(factor => {
        if (adjustments[comp.id][factor]) {
          adjustmentTotal += adjustments[comp.id][factor];
        }
      });
      
      const originalPrice = parseFloat(comp.price);
      const adjustmentMultiplier = 1 + (adjustmentTotal / 100);
      return originalPrice * adjustmentMultiplier;
    } catch (e) {
      return parseFloat(comp.price);
    }
  };
  
  // Calculate adjusted values for all comps
  const calculateAdjustedValues = () => {
    const values = comps.map(comp => calculateAdjustedValue(comp));
    return values;
  };
  
  // Calculate adjusted price per SF
  const calculateAdjustedPricePSF = (comp) => {
    try {
      const adjustedValue = calculateAdjustedValue(comp);
      const sizeSF = parseFloat(comp.size_sf);
      if (adjustedValue && sizeSF && sizeSF > 0) {
        return (adjustedValue / sizeSF).toFixed(2);
      }
      return '0';
    } catch (e) {
      return '0';
    }
  };
  
  // Calculate average of adjusted values
  const calculateAverageValue = () => {
    const adjustedValues = calculateAdjustedValues();
    if (adjustedValues.length === 0) return 0;
    
    const sum = adjustedValues.reduce((a, b) => a + b, 0);
    return sum / adjustedValues.length;
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Research Stage</Typography>
      <Typography variant="body2" paragraph>
        Research and analyze the selected comparable properties. Apply adjustments based on differences between the subject property and each comparable.
      </Typography>
      
      {validationResults.issues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please complete the adjustment analysis to proceed to the next stage.
        </Alert>
      )}
      
      {renderValidationAlerts()}
      
      {/* Adjustment Factors Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Adjustment Factors</Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {Object.keys(adjustmentFactors).map(factor => (
              <Grid item xs={12} sm={6} key={factor}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ width: '30%', textTransform: 'capitalize' }}>
                    {factor}
                  </Typography>
                  <Slider
                    value={adjustmentFactors[factor].weight}
                    onChange={(e, newValue) => handleFactorWeightChange(factor, newValue)}
                    min={0}
                    max={50}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ width: '50%', mx: 2 }}
                  />
                  <Typography variant="body2" sx={{ width: '20%' }}>
                    Weight: {adjustmentFactors[factor].weight}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {adjustmentFactors[factor].description}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      
      {/* Comparables Adjustment Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Comparable Properties Adjustments</Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveAdjustments}
            >
              Save Adjustments
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  {Object.keys(adjustmentFactors).map(factor => (
                    <TableCell key={factor} align="center" sx={{ textTransform: 'capitalize' }}>
                      {factor}
                    </TableCell>
                  ))}
                  <TableCell align="right">Original Price</TableCell>
                  <TableCell align="right">Adjusted Price</TableCell>
                  <TableCell align="right">Adj. Price/SF</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={Object.keys(adjustmentFactors).length + 4} align="center">
                      No comparable properties selected
                    </TableCell>
                  </TableRow>
                ) : (
                  comps.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell>{comp.property_name}</TableCell>
                      
                      {Object.keys(adjustmentFactors).map(factor => (
                        <TableCell key={`${comp.id}-${factor}`} align="center">
                          {editingAdjustment && 
                           editingAdjustment.compId === comp.id && 
                           editingAdjustment.factor === factor ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TextField
                                size="small"
                                type="number"
                                value={adjustments[comp.id]?.[factor] || 0}
                                onChange={(e) => handleAdjustmentChange(
                                  comp.id, 
                                  factor, 
                                  parseInt(e.target.value, 10)
                                )}
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                  inputProps: { min: -50, max: 50 }
                                }}
                                sx={{ width: 100 }}
                              />
                              <IconButton size="small" onClick={cancelEditingAdjustment}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography>{adjustments[comp.id]?.[factor] || 0}%</Typography>
                              <IconButton 
                                size="small" 
                                onClick={() => startEditingAdjustment(comp.id, factor)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      ))}
                      
                      <TableCell align="right">${comp.price}</TableCell>
                      <TableCell align="right">
                        ${calculateAdjustedValue(comp).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell align="right">${calculateAdjustedPricePSF(comp)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {comps.length > 0 && (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={Object.keys(adjustmentFactors).length + 1} align="right">
                      <Typography variant="subtitle1">Average Adjusted Value:</Typography>
                    </TableCell>
                    <TableCell align="right" colSpan={3}>
                      <Typography variant="subtitle1">
                        ${calculateAverageValue().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResearchStage;
