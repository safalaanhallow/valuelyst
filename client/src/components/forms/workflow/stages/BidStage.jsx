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
  Checkbox,
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
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';

const BidStage = ({ workflow, property, validationResults, onValidate, onUpdate }) => {
  const [comps, setComps] = useState([]);
  const [availableComps, setAvailableComps] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({ query: '', propertyType: '' });
  const [searchResults, setSearchResults] = useState([]);
  
  // Load existing comps on component mount
  useEffect(() => {
    loadComps();
    searchComparables();
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
  
  // Search for available comparable properties
  const searchComparables = async () => {
    try {
      // In a real application, this would search the database for comparable properties
      // For now, we'll simulate with some sample data
      const response = await axios.get('/api/properties', {
        params: {
          // Add search parameters as needed
          query: searchParams.query,
          property_type: searchParams.propertyType
        }
      });
      
      // Filter out the current property
      const filteredResults = response.data.filter(p => p.id !== property.id);
      setAvailableComps(filteredResults);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching for comparable properties:', error);
    }
  };
  
  // Handle search parameter changes
  const handleSearchParamChange = (event) => {
    const { name, value } = event.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };
  
  // Add a comp to the selection
  const addComp = (comp) => {
    try {
      // Check if this comp is already selected
      if (comps.some(c => c.id === comp.id)) {
        return;
      }
      
      // Extract relevant information for comparison
      const newComp = {
        id: comp.id,
        property_name: extractPropertyName(comp),
        address: extractAddress(comp),
        property_type: extractPropertyType(comp),
        size_sf: extractSizeSF(comp),
        price: extractPrice(comp),
        cap_rate: extractCapRate(comp),
        noi: extractNOI(comp),
        price_per_sf: calculatePricePSF(comp),
        year_built: extractYearBuilt(comp),
        selected_date: new Date().toISOString()
      };
      
      // Add to comps array
      const updatedComps = [...comps, newComp];
      setComps(updatedComps);
      
      // Save to property
      saveCompsToProperty(updatedComps);
    } catch (error) {
      console.error('Error adding comp:', error);
    }
  };
  
  // Remove a comp from the selection
  const removeComp = (compId) => {
    try {
      const updatedComps = comps.filter(c => c.id !== compId);
      setComps(updatedComps);
      saveCompsToProperty(updatedComps);
    } catch (error) {
      console.error('Error removing comp:', error);
    }
  };
  
  // Save comps to property
  const saveCompsToProperty = async (updatedComps) => {
    try {
      await axios.put(`/api/properties/${property.id}`, {
        comps: JSON.stringify(updatedComps)
      });
      
      if (onUpdate) onUpdate();
      if (onValidate) onValidate();
    } catch (error) {
      console.error('Error saving comps to property:', error);
    }
  };
  
  // Helper functions to extract property data
  const extractPropertyName = (prop) => {
    try {
      const identification = prop.identification ? JSON.parse(prop.identification) : {};
      return identification.property_name || 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  };
  
  const extractAddress = (prop) => {
    try {
      const identification = prop.identification ? JSON.parse(prop.identification) : {};
      return identification.address || 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  };
  
  const extractPropertyType = (prop) => {
    try {
      const physical = prop.physical ? JSON.parse(prop.physical) : {};
      return physical.property_type || 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  };
  
  const extractSizeSF = (prop) => {
    try {
      const physical = prop.physical ? JSON.parse(prop.physical) : {};
      return physical.total_building_sf || '0';
    } catch (e) {
      return '0';
    }
  };
  
  const extractPrice = (prop) => {
    try {
      const valuations = prop.valuations ? JSON.parse(prop.valuations) : {};
      return valuations.sale_price || valuations.estimated_value || '0';
    } catch (e) {
      return '0';
    }
  };
  
  const extractCapRate = (prop) => {
    try {
      const valuations = prop.valuations ? JSON.parse(prop.valuations) : {};
      return valuations.cap_rate || '0';
    } catch (e) {
      return '0';
    }
  };
  
  const extractNOI = (prop) => {
    try {
      const income = prop.income ? JSON.parse(prop.income) : {};
      return income.noi || '0';
    } catch (e) {
      return '0';
    }
  };
  
  const extractYearBuilt = (prop) => {
    try {
      const physical = prop.physical ? JSON.parse(prop.physical) : {};
      return physical.year_built || 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  };
  
  const calculatePricePSF = (prop) => {
    try {
      const price = parseFloat(extractPrice(prop));
      const sizeSF = parseFloat(extractSizeSF(prop));
      if (price && sizeSF && sizeSF > 0) {
        return (price / sizeSF).toFixed(2);
      }
      return '0';
    } catch (e) {
      return '0';
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Bid Stage</Typography>
      <Typography variant="body2" paragraph>
        Select at least 3 comparable properties for the valuation analysis. Comparable properties should have similar characteristics to the subject property.
      </Typography>
      
      {validationResults.issues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {validationResults.issues.find(issue => issue.includes('comparable'))}
        </Alert>
      )}
      
      {/* Selected Comps Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Selected Comparable Properties</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add Comp
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Property Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Property Type</TableCell>
                  <TableCell align="right">Size (SF)</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Price/SF</TableCell>
                  <TableCell align="right">Cap Rate</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No comparable properties selected</TableCell>
                  </TableRow>
                ) : (
                  comps.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell>{comp.property_name}</TableCell>
                      <TableCell>{comp.address}</TableCell>
                      <TableCell>{comp.property_type}</TableCell>
                      <TableCell align="right">{comp.size_sf}</TableCell>
                      <TableCell align="right">${comp.price}</TableCell>
                      <TableCell align="right">${comp.price_per_sf}</TableCell>
                      <TableCell align="right">{comp.cap_rate}%</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeComp(comp.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box mt={2}>
            <Typography variant="body2" color={comps.length >= 3 ? 'success.main' : 'error.main'}>
              {comps.length >= 3 
                ? `✓ ${comps.length} comps selected (minimum 3 required)` 
                : `⚠ ${comps.length} comps selected (minimum 3 required)`}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      {/* Dialog for selecting comps */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Comparable Properties</DialogTitle>
        <DialogContent>
          {/* Search Controls */}
          <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Search"
                name="query"
                value={searchParams.query}
                onChange={handleSearchParamChange}
                placeholder="Enter property name or address"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  name="propertyType"
                  value={searchParams.propertyType}
                  onChange={handleSearchParamChange}
                  label="Property Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Office">Office</MenuItem>
                  <MenuItem value="Retail">Retail</MenuItem>
                  <MenuItem value="Industrial">Industrial</MenuItem>
                  <MenuItem value="Multifamily">Multifamily</MenuItem>
                  <MenuItem value="Hospitality">Hospitality</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<SearchIcon />}
                onClick={searchComparables}
                sx={{ height: '100%' }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
          
          {/* Search Results */}
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Select</TableCell>
                  <TableCell>Property Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Property Type</TableCell>
                  <TableCell align="right">Size (SF)</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Cap Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No comparable properties found</TableCell>
                  </TableRow>
                ) : (
                  searchResults.map((result) => {
                    const isSelected = comps.some(c => c.id === result.id);
                    return (
                      <TableRow key={result.id} selected={isSelected}>
                        <TableCell>
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => isSelected ? removeComp(result.id) : addComp(result)}
                          />
                        </TableCell>
                        <TableCell>{extractPropertyName(result)}</TableCell>
                        <TableCell>{extractAddress(result)}</TableCell>
                        <TableCell>{extractPropertyType(result)}</TableCell>
                        <TableCell align="right">{extractSizeSF(result)}</TableCell>
                        <TableCell align="right">${extractPrice(result)}</TableCell>
                        <TableCell align="right">{extractCapRate(result)}%</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BidStage;
