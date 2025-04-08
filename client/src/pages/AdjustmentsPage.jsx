import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import { createFieldNameHelper, createChangeHandler } from '../utils/formHelpers';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const AdjustmentsPage = ({ formik }) => {
  // Create helper functions for this component
  const fieldName = createFieldNameHelper('adjustments');
  const handleChange = createChangeHandler(formik);
  
  // Ensure values is initialized
  const values = formik.values || {};
  // State for expanded adjustment categories
  const [expandedCategory, setExpandedCategory] = useState(null);
  // State for the selected comp to adjust
  const [selectedComp, setSelectedComp] = useState(null);

  // Define the adjustment categories and their fields
  const adjustmentCategories = [
    {
      id: 'market',
      title: 'Market Conditions',
      fields: [
        { id: 'timeAdjustment', label: 'Time/Date of Sale', type: 'percentage' },
        { id: 'marketTrends', label: 'Market Trends', type: 'percentage' },
        { id: 'economicChanges', label: 'Economic Changes', type: 'percentage' }
      ]
    },
    {
      id: 'location',
      title: 'Location',
      fields: [
        { id: 'neighborhood', label: 'Neighborhood', type: 'percentage' },
        { id: 'accessibility', label: 'Accessibility', type: 'percentage' },
        { id: 'visibility', label: 'Visibility', type: 'percentage' },
        { id: 'cornerInfluence', label: 'Corner Influence', type: 'percentage' }
      ]
    },
    {
      id: 'physical',
      title: 'Physical Characteristics',
      fields: [
        { id: 'size', label: 'Size/SF', type: 'percentage' },
        { id: 'landToBuilding', label: 'Land to Building Ratio', type: 'percentage' },
        { id: 'age', label: 'Age/Condition', type: 'percentage' },
        { id: 'construction', label: 'Construction Quality', type: 'percentage' },
        { id: 'functionality', label: 'Functionality', type: 'percentage' },
        { id: 'parking', label: 'Parking Ratio', type: 'percentage' },
        { id: 'amenities', label: 'Amenities', type: 'percentage' }
      ]
    },
    {
      id: 'economic',
      title: 'Economic Characteristics',
      fields: [
        { id: 'occupancyRate', label: 'Occupancy Rate', type: 'percentage' },
        { id: 'tenantQuality', label: 'Tenant Quality', type: 'percentage' },
        { id: 'leaseTerms', label: 'Lease Terms', type: 'percentage' },
        { id: 'incomeStability', label: 'Income Stability', type: 'percentage' },
        { id: 'expenseRatio', label: 'Expense Ratio', type: 'percentage' }
      ]
    },
    {
      id: 'legal',
      title: 'Legal & Zoning',
      fields: [
        { id: 'zoning', label: 'Zoning', type: 'percentage' },
        { id: 'entitlements', label: 'Entitlements', type: 'percentage' },
        { id: 'environmentalIssues', label: 'Environmental Issues', type: 'percentage' }
      ]
    },
    {
      id: 'other',
      title: 'Other Adjustments',
      fields: [
        { id: 'custom1', label: 'Custom Adjustment 1', type: 'percentage' },
        { id: 'custom2', label: 'Custom Adjustment 2', type: 'percentage' }
      ]
    }
  ];

  // Function to add a new comp to adjust
  const addComp = () => {
    const comps = [...(formik.values.comps || [])];
    const newCompId = comps.length > 0 ? Math.max(...comps.map(c => c.id)) + 1 : 1;

    // Create a new blank comp with empty adjustment values
    const newComp = {
      id: newCompId,
      name: `Comparable ${newCompId}`,
      address: '',
      saleDate: '',
      salePrice: '',
      pricePerSF: '',
      squareFeet: '',
      yearBuilt: '',
      type: '',
      description: '',
      image: '',
      adjustments: {}
    };
    
    // Initialize all adjustment categories and fields
    adjustmentCategories.forEach(category => {
      newComp.adjustments[category.id] = {};
      category.fields.forEach(field => {
        newComp.adjustments[category.id][field.id] = {
          value: 0,
          notes: ''
        };
      });
    });

    comps.push(newComp);
    formik.setFieldValue('comps', comps);
    setSelectedComp(newComp);
  };

  // Function to remove a comp
  const removeComp = (id) => {
    const comps = formik.values.comps.filter(comp => comp.id !== id);
    formik.setFieldValue('comps', comps);
    if (selectedComp && selectedComp.id === id) {
      setSelectedComp(comps.length > 0 ? comps[0] : null);
    }
  };

  // Function to update a comp's basic info
  const updateCompInfo = (field, value) => {
    if (!selectedComp) return;

    const comps = [...(formik.values.comps || [])];
    const compIndex = comps.findIndex(comp => comp.id === selectedComp.id);
    
    if (compIndex >= 0) {
      comps[compIndex] = {
        ...comps[compIndex],
        [field]: value
      };

      // Auto-calculate price per SF if both price and SF are available
      if (field === 'salePrice' || field === 'squareFeet') {
        const price = field === 'salePrice' ? parseFloat(value) : parseFloat(comps[compIndex].salePrice);
        const sf = field === 'squareFeet' ? parseFloat(value) : parseFloat(comps[compIndex].squareFeet);
        
        if (!isNaN(price) && !isNaN(sf) && sf > 0) {
          comps[compIndex].pricePerSF = (price / sf).toFixed(2);
        }
      }

      formik.setFieldValue('comps', comps);
      setSelectedComp(comps[compIndex]);
    }
  };

  // Function to update an adjustment value
  const updateAdjustment = (categoryId, fieldId, subField, value) => {
    if (!selectedComp) return;

    const comps = [...(formik.values.comps || [])];
    const compIndex = comps.findIndex(comp => comp.id === selectedComp.id);
    
    if (compIndex >= 0) {
      // Ensure the adjustment structure exists
      if (!comps[compIndex].adjustments) {
        comps[compIndex].adjustments = {};
      }
      if (!comps[compIndex].adjustments[categoryId]) {
        comps[compIndex].adjustments[categoryId] = {};
      }
      if (!comps[compIndex].adjustments[categoryId][fieldId]) {
        comps[compIndex].adjustments[categoryId][fieldId] = { value: 0, notes: '' };
      }

      // Update the specified subfield (value or notes)
      comps[compIndex].adjustments[categoryId][fieldId][subField] = value;
      
      formik.setFieldValue('comps', comps);
      setSelectedComp(comps[compIndex]);
    }
  };

  // Calculate the total adjustment percentage for a comp
  const calculateTotalAdjustment = (comp) => {
    if (!comp || !comp.adjustments) return 0;

    let totalAdjustment = 0;
    
    // Sum up all adjustment values across all categories
    adjustmentCategories.forEach(category => {
      if (comp.adjustments[category.id]) {
        category.fields.forEach(field => {
          if (comp.adjustments[category.id][field.id]) {
            totalAdjustment += parseFloat(comp.adjustments[category.id][field.id].value || 0);
          }
        });
      }
    });

    return totalAdjustment;
  };

  // Calculate the adjusted value for a comp
  const calculateAdjustedValue = (comp) => {
    if (!comp || !comp.pricePerSF) return 0;
    
    const baseValue = parseFloat(comp.pricePerSF);
    if (isNaN(baseValue)) return 0;
    
    const totalAdjustmentPercent = calculateTotalAdjustment(comp);
    const adjustmentMultiplier = 1 + (totalAdjustmentPercent / 100);
    
    return (baseValue * adjustmentMultiplier).toFixed(2);
  };

  // Calculate overall statistics for adjusted values
  const calculateStatistics = () => {
    const comps = formik.values.comps || [];
    
    if (comps.length === 0) {
      return { min: 0, max: 0, average: 0, median: 0 };
    }
    
    const adjustedValues = comps.map(comp => parseFloat(calculateAdjustedValue(comp)));
    const sortedValues = [...adjustedValues].sort((a, b) => a - b);
    
    const min = Math.min(...adjustedValues);
    const max = Math.max(...adjustedValues);
    const sum = adjustedValues.reduce((a, b) => a + b, 0);
    const average = sum / adjustedValues.length;
    
    // Calculate median
    let median;
    if (sortedValues.length % 2 === 0) {
      median = (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2;
    } else {
      median = sortedValues[Math.floor(sortedValues.length / 2)];
    }
    
    return { min, max, average, median };
  };

  // If the comps array is empty or not initialized, set it to an empty array
  useEffect(() => {
    if (!formik.values.comps) {
      formik.setFieldValue('comps', []);
    } else if (formik.values.comps.length > 0 && !selectedComp) {
      // Auto-select the first comp if none is selected
      setSelectedComp(formik.values.comps[0]);
    }
  }, [formik.values.comps]);

  // Statistics for the adjusted values
  const stats = calculateStatistics();

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Comparable Properties Adjustments
      </Typography>
      <Typography variant="body2" paragraph>
        Add comparable properties and make adjustments to calculate the subject property value.
      </Typography>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Min Adjusted Value (PSF)"
            value={`$${stats.min.toFixed(2)}`}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Max Adjusted Value (PSF)"
            value={`$${stats.max.toFixed(2)}`}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Average Adjusted Value (PSF)"
            value={`$${stats.average.toFixed(2)}`}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Median Adjusted Value (PSF)"
            value={`$${stats.median.toFixed(2)}`}
            InputProps={{ readOnly: true }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left side - List of comps */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Comparable Properties</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={addComp}
                size="small"
              >
                Add Comp
              </Button>
            </Box>

            {/* List of comps */}
            {(formik.values.comps || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
                No comparable properties added yet. Click "Add Comp" to get started.
              </Typography>
            ) : (
              <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                {(formik.values.comps || []).map((comp) => (
                  <Card 
                    key={comp.id} 
                    variant="outlined" 
                    sx={{ 
                      mb: 1, 
                      cursor: 'pointer',
                      backgroundColor: selectedComp && selectedComp.id === comp.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                    }}
                    onClick={() => setSelectedComp(comp)}
                  >
                    <CardContent sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: selectedComp && selectedComp.id === comp.id ? 'bold' : 'normal' }}>
                          {comp.name || `Comparable ${comp.id}`}
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeComp(comp.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {comp.pricePerSF ? `$${comp.pricePerSF}/SF` : ''}
                        {comp.squareFeet ? ` · ${comp.squareFeet.toLocaleString()} SF` : ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {comp.address}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="primary">
                          Total Adjustment: 
                          <span style={{ 
                            color: calculateTotalAdjustment(comp) > 0 ? 'green' : 
                                  calculateTotalAdjustment(comp) < 0 ? 'red' : 'inherit' 
                          }}>
                            {` ${calculateTotalAdjustment(comp) > 0 ? '+' : ''}${calculateTotalAdjustment(comp)}%`}
                          </span>
                        </Typography>
                        <Typography variant="body2" color="primary">
                          Adj. Value: <strong>${calculateAdjustedValue(comp)}</strong>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right side - Adjustment details */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {selectedComp ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Adjust: {selectedComp.name || `Comparable ${selectedComp.id}`}
                </Typography>
                
                {/* Basic comp info */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Comparable Name"
                      value={selectedComp.name || ''}
                      onChange={(e) => updateCompInfo('name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Property Type"
                      value={selectedComp.type || ''}
                      onChange={(e) => updateCompInfo('type', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={selectedComp.address || ''}
                      onChange={(e) => updateCompInfo('address', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Sale Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={selectedComp.saleDate || ''}
                      onChange={(e) => updateCompInfo('saleDate', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Sale Price"
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      value={selectedComp.salePrice || ''}
                      onChange={(e) => updateCompInfo('salePrice', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Square Feet"
                      type="number"
                      value={selectedComp.squareFeet || ''}
                      onChange={(e) => updateCompInfo('squareFeet', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Price Per SF"
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        readOnly: true
                      }}
                      value={selectedComp.pricePerSF || ''}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Year Built"
                      type="number"
                      value={selectedComp.yearBuilt || ''}
                      onChange={(e) => updateCompInfo('yearBuilt', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Adjusted Value (PSF)"
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        readOnly: true
                      }}
                      value={calculateAdjustedValue(selectedComp)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={2}
                      value={selectedComp.description || ''}
                      onChange={(e) => updateCompInfo('description', e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />
                
                {/* Adjustments */}
                <Typography variant="h6" gutterBottom>
                  Adjustments
                </Typography>
                <Typography variant="body2" paragraph>
                  Enter positive percentages for superior subject property features and negative percentages for inferior features.
                </Typography>

                {/* Adjustment accordions by category */}
                {adjustmentCategories.map((category) => (
                  <Accordion 
                    key={category.id}
                    expanded={expandedCategory === category.id}
                    onChange={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{category.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Adjustment</TableCell>
                              <TableCell align="right" width="150px">Value (%)</TableCell>
                              <TableCell>Notes</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {category.fields.map((field) => {
                              // Get current adjustment value and notes
                              const adjustmentValue = selectedComp.adjustments?.[category.id]?.[field.id]?.value || 0;
                              const adjustmentNotes = selectedComp.adjustments?.[category.id]?.[field.id]?.notes || '';
                              
                              return (
                                <TableRow key={field.id}>
                                  <TableCell>{field.label}</TableCell>
                                  <TableCell align="right">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Tooltip title="Decrease by 1%">
                                        <IconButton 
                                          size="small"
                                          onClick={() => {
                                            const newValue = parseFloat(adjustmentValue) - 1;
                                            updateAdjustment(category.id, field.id, 'value', newValue);
                                          }}
                                        >
                                          <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={adjustmentValue}
                                        onChange={(e) => updateAdjustment(category.id, field.id, 'value', e.target.value)}
                                        InputProps={{
                                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                          inputProps: { 
                                            style: { textAlign: 'right' },
                                            step: 0.5 
                                          }
                                        }}
                                        sx={{ width: '80px', '& input': { textAlign: 'right' } }}
                                      />
                                      <Tooltip title="Increase by 1%">
                                        <IconButton 
                                          size="small"
                                          onClick={() => {
                                            const newValue = parseFloat(adjustmentValue) + 1;
                                            updateAdjustment(category.id, field.id, 'value', newValue);
                                          }}
                                        >
                                          <ArrowUpwardIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      placeholder="Justification for adjustment"
                                      value={adjustmentNotes}
                                      onChange={(e) => updateAdjustment(category.id, field.id, 'notes', e.target.value)}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}

                {/* Total adjustments summary */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Adjustment Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Base Price Per SF"
                        InputProps={{ 
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          readOnly: true
                        }}
                        value={selectedComp.pricePerSF || '0.00'}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Total Adjustment"
                        InputProps={{ 
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          readOnly: true
                        }}
                        value={calculateTotalAdjustment(selectedComp)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Adjusted Value Per SF"
                        InputProps={{ 
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          readOnly: true
                        }}
                        value={calculateAdjustedValue(selectedComp)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Select a comparable property from the list to make adjustments,
                  or click "Add Comp" to create a new one.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AdjustmentsPage;
