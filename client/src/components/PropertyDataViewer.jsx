import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// Define data categories with their corresponding field mappings
const DATA_CATEGORIES = {
  propertyInfo: {
    title: 'Property Information',
    icon: '🏢',
    fields: [
      'Property Id', 'Property Name', 'Property Type', 'Market', 'Property Major Type', 
      'Property Sub Type', 'Address', 'City', 'County', 'State', 'Zip', 'Latitude', 
      'Longitude', 'Tax ID', 'Legal Description', 'Book/Page or Reference Doc'
    ]
  },
  landInfo: {
    title: 'Land & Site Details',
    icon: '🏞️',
    fields: [
      'Acres', 'Land SF', 'Usable Acres', 'Usable Land SF', 'Land Units', 'Land Unit Type',
      'Land Unit Approved Or Zoned', 'Road Frontage', 'Water Frontage', 'Effective Water Frontage',
      'Depth', 'Shape', 'View', 'Topography', 'Utilities', 'Zoning', 'Zoning Type', 'FAR',
      'Flood Zone', 'Encumbrance Or Easement', 'Environmental Issues', 'Access', 'Corner',
      'Dimensions', 'Primary Frontage Feet', 'Primary Frontage Street', 'Visibility'
    ]
  },
  buildingDetails: {
    title: 'Building Specifications',
    icon: '🏗️',
    fields: [
      'Multifamily GBA', 'Office GBA', 'Retail GBA', 'Industrial GBA', 'Other GBA', 'GBA',
      'Rentable Area', 'No. of Buildings', 'No. of Stories', 'No. of Units', 'Year Built',
      'Construction', 'Building Class', 'Quality', 'Condition', 'Design Appeal',
      'Ceiling Height', 'Column Spacing', 'Typical Bay Depth', 'Roof Type', 'Roof Cover',
      'Heating', 'Cooling', 'Foundation', 'Exterior Wall'
    ]
  },
  physicalFeatures: {
    title: 'Physical Features & Amenities',
    icon: '🏛️',
    fields: [
      'No. of Truck Doors', 'No. of Elevators', 'No. of Escalators', 'Fire Sprinkler Type',
      'Basement Size', 'Basement Use and Finish', 'Parking Spaces', 'Parking Ratio GBA',
      'Parking Adequacy', 'Multifamily Amenities', 'Landscaping', 'Ancillary Buildings',
      'Garage', 'No. of Rooms', 'No. of Beds', 'No. of Bedrooms', 'No. of Bathrooms',
      'Fireplace or WoodStove', 'Porch or Deck', 'Dock or Boathouse'
    ]
  },
  financialData: {
    title: 'Financial & Cost Data',
    icon: '💰',
    fields: [
      'Land Assessment', 'Improvement Assessment', 'Total Assessment', 'Tax Rate', 'Taxes',
      'Land Costs', 'Building Improvs', 'Total Costs', 'Land Costs Per SF', 'Building Improvs Per SF',
      'Total Costs Per SF', 'Assessment Year', 'Equalization Ratio', 'Implied Value',
      'Cost Source And Comments', 'Price Per SF', 'Price Per Unit', 'Price Per Acre',
      'Taxes/SF GBA', 'Taxes/Unit', 'Taxes/Land SF'
    ]
  },
  incomeExpenses: {
    title: 'Income & Operating Data',
    icon: '📊',
    fields: [
      'Rental Income', 'Other Income', 'EGI', 'EGI Per SF', 'EGI Per Unit', 'PGI', 'PGI Per SF',
      'PGI Per Unit', 'Occupancy', 'Vacancy', 'Vacancy Amount', 'NOI', 'Net Operating Income Per SF',
      'Insurance', 'Total Utilities', 'Repairs And Maintenance', 'Management', 'Total Expenses',
      'Expense Ratio', 'Expense Per SF', 'Cap Rate', 'EGIM', 'PGIM'
    ]
  },
  saleInfo: {
    title: 'Sale & Transaction Details',
    icon: '📝',
    fields: [
      'Grantor', 'Grantee', 'Date', 'Transaction Type', 'Price', 'Financing', 'Property Rights',
      'Days On Market', 'Sale Supporting Files', 'Sale Notes', 'Conditions of Sale',
      'Recording Date', 'Sale Verification Date', 'Sale Verification Source', 'Current Use',
      'Proposed Use', 'Buyer Type', 'Lender'
    ]
  },
  marketData: {
    title: 'Market & Location Data',
    icon: '🌍',
    fields: [
      'Submarket', 'CBSA Name', 'MSA', 'Neighborhood', 'School District', 'Demographics Survey Date',
      'Median Home Value', 'Median Household Income', 'Traffic Count', 'Traffic Survey Date',
      'Market Value', 'Location Description', 'Census Block', 'Census Tract'
    ]
  },
  environmental: {
    title: 'Environmental & Regulatory',
    icon: '🌱',
    fields: [
      'Flood Zone', 'Environmental Issues', 'Environmental Status', 'Zoning', 'Zoning Comments',
      'Zoning District', 'Municipality', 'Opportunity Zone', 'FEMA Map Date', 'Soil Type',
      'Drainage', 'Wetlands Type', 'Water Rights'
    ]
  },
  calculations: {
    title: 'Calculated Metrics & Ratios',
    icon: '🧮',
    fields: [
      'Price Per RA', 'NOI Per Unit', 'NOI Per GBA M2', 'NOI Per RA SF', 'Land To Building Ratio',
      'Load Factor', 'Expense Growth Rate', 'Income Growth Rate', 'Terminal Cap Rate',
      'Discount Rate', 'Room Revenue Multiplier', 'RevPAR', 'ADR', 'Percent Office',
      'TOS Cap Rate', 'TOS Occupancy Rate', 'TOS Vacancy Rate'
    ]
  }
};

const PropertyDataViewer = ({ property, expanded = false, showSearch = true, maxHeight = '600px' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isExpanded, setIsExpanded] = useState(expanded);

  // Get raw data from property object
  const rawData = property?.rawData || property?.raw_data || {};
  
  // Helper function to format field values
  const formatValue = (value, fieldName) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    
    // Format currency fields
    if (fieldName.toLowerCase().includes('price') || 
        fieldName.toLowerCase().includes('cost') || 
        fieldName.toLowerCase().includes('income') ||
        fieldName.toLowerCase().includes('expense') ||
        fieldName.toLowerCase().includes('assessment') ||
        fieldName.toLowerCase().includes('value')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 1000) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numValue);
      }
    }
    
    // Format percentage fields
    if (fieldName.toLowerCase().includes('rate') || 
        fieldName.toLowerCase().includes('ratio') ||
        fieldName.toLowerCase().includes('percent')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue < 100) {
        return `${numValue}%`;
      }
    }
    
    // Format numbers with commas
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return numValue.toLocaleString();
      }
    }
    
    return value.toString();
  };

  // Filter data based on search term
  const filterData = (categoryData, searchTerm) => {
    if (!searchTerm) return categoryData;
    
    return categoryData.filter(([field, value]) => 
      field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get data for a specific category
  const getCategoryData = (categoryKey) => {
    const category = DATA_CATEGORIES[categoryKey];
    const data = category.fields.map(field => {
      const value = rawData[field] || rawData[field.replace(/\s+/g, '_')] || rawData[field.replace(/\s+/g, '')];
      return [field, formatValue(value, field)];
    }).filter(([field, value]) => value !== 'N/A' || !searchTerm); // Show N/A only when not searching

    return filterData(data, searchTerm);
  };

  // Count non-empty fields for each category
  const getCategoryStats = (categoryKey) => {
    const data = getCategoryData(categoryKey);
    const nonEmptyCount = data.filter(([field, value]) => value !== 'N/A').length;
    return { total: DATA_CATEGORIES[categoryKey].fields.length, populated: nonEmptyCount };
  };

  const categories = Object.keys(DATA_CATEGORIES);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Property Summary Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {property?.property_name || property?.name || 'Property Details'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property?.address && property?.city ? `${property.address}, ${property.city}` : 'Location not specified'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={`${Object.keys(rawData).length} data points`} 
              size="small" 
              variant="outlined" 
            />
            <IconButton 
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
            >
              <ExpandMoreIcon 
                sx={{ 
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={isExpanded}>
          <Box>
            {/* Search Bar */}
            {showSearch && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search property data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => setSearchTerm('')}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            )}

            {/* Category Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {categories.map((categoryKey, index) => {
                  const category = DATA_CATEGORIES[categoryKey];
                  const stats = getCategoryStats(categoryKey);
                  return (
                    <Tab 
                      key={categoryKey}
                      label={
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2">
                            {category.icon} {category.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stats.populated}/{stats.total}
                          </Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </Tabs>
            </Box>

            {/* Category Content */}
            <Box sx={{ maxHeight, overflow: 'auto' }}>
              {categories.map((categoryKey, index) => (
                <Box key={categoryKey} hidden={activeTab !== index}>
                  {activeTab === index && (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableBody>
                          {getCategoryData(categoryKey).map(([field, value], idx) => (
                            <TableRow 
                              key={idx}
                              sx={{ 
                                '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                                '&:hover': { backgroundColor: 'action.selected' }
                              }}
                            >
                              <TableCell sx={{ fontWeight: 'medium', width: '40%' }}>
                                {field}
                              </TableCell>
                              <TableCell>
                                {value}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PropertyDataViewer;
