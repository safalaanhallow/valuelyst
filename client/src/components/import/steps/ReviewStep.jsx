import React, { useState } from 'react';
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
  Button,
  Alert,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const ReviewStep = ({ previewData, mappings, onContinue, propertyId }) => {
  const [expanded, setExpanded] = useState(false);

  // Filter out unmapped fields
  const validMappings = Object.entries(mappings)
    .filter(([_, value]) => value)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  // Count mapped fields
  const mappedFieldCount = Object.values(validMappings).length;
  
  // Generate sample data for the first 5 rows based on mappings
  const generateSampleData = () => {
    if (!previewData || previewData.length === 0) return [];
    
    return previewData.slice(0, 5).map(row => {
      const mappedRow = {};
      
      Object.entries(validMappings).forEach(([targetField, sourceColumn]) => {
        mappedRow[targetField] = row[sourceColumn];
      });
      
      return mappedRow;
    });
  };

  const sampleData = generateSampleData();
  
  // Count mapped field categories
  const getCategoryMappingCounts = () => {
    const categories = {
      identification: ['property_name', 'address', 'city', 'state', 'zip_code', 'county', 'property_type', 'sub_type'],
      physical: ['year_built', 'building_class', 'total_building_sf', 'lot_size_sf', 'lot_size_acres', 'stories'],
      financial: ['price', 'price_per_sf', 'cap_rate', 'noi', 'vacancy_rate', 'operating_expenses'],
      transaction: ['sale_date', 'sale_type', 'days_on_market', 'seller', 'buyer']
    };
    
    const counts = {};
    
    Object.entries(categories).forEach(([category, fields]) => {
      const mappedInCategory = fields.filter(field => validMappings[field]).length;
      counts[category] = {
        mapped: mappedInCategory,
        total: fields.length,
        percentage: Math.round((mappedInCategory / fields.length) * 100)
      };
    });
    
    return counts;
  };

  const categoryCounts = getCategoryMappingCounts();
  
  // Get validation issues
  const getValidationIssues = () => {
    const issues = [];
    
    // Check for minimum required fields
    const requiredFields = ['property_name', 'address', 'city', 'state', 'property_type'];
    const missingRequired = requiredFields.filter(field => !validMappings[field]);
    
    if (missingRequired.length > 0) {
      issues.push({
        severity: 'warning',
        message: `Missing recommended fields: ${missingRequired.join(', ')}`
      });
    }
    
    // Check if financial data is mapped
    const financialFields = ['price', 'price_per_sf', 'cap_rate', 'noi'];
    const hasMappedFinancial = financialFields.some(field => validMappings[field]);
    
    if (!hasMappedFinancial) {
      issues.push({
        severity: 'info',
        message: 'No financial metrics are mapped (price, cap rate, NOI, etc.)'
      });
    }
    
    return issues;
  };

  const validationIssues = getValidationIssues();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Review and Confirm Import</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review your field mappings and sample data before importing. Once you confirm, the data will be imported as comparable properties.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Import Summary</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Property ID" 
                  secondary={propertyId}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Total Records" 
                  secondary={previewData?.length || 0}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Mapped Fields" 
                  secondary={`${mappedFieldCount} out of ${Object.keys(mappings).length} available fields`}
                />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Data Coverage</Typography>
            {Object.entries(categoryCounts).map(([category, counts]) => (
              <Box key={category} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2">{category}</Typography>
                  <Typography variant="body2">{counts.mapped}/{counts.total}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'grey.300', borderRadius: 1, height: 8, width: '100%' }}>
                  <Box 
                    sx={{ 
                      bgcolor: counts.percentage > 70 ? 'success.main' : counts.percentage > 30 ? 'warning.main' : 'error.main',
                      borderRadius: 1,
                      height: 8,
                      width: `${counts.percentage}%`
                    }} 
                  />
                </Box>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Validation issues */}
      {validationIssues.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Validation Issues</Typography>
          {validationIssues.map((issue, index) => (
            <Alert key={index} severity={issue.severity} sx={{ mb: 1 }}>
              {issue.message}
            </Alert>
          ))}
        </Box>
      )}
      
      {/* Field mappings */}
      <Typography variant="subtitle1" gutterBottom>Field Mappings</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell width="50%">Target Field</TableCell>
                <TableCell width="50%">Source Column</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(validMappings).map(([targetField, sourceColumn]) => (
                <TableRow key={targetField}>
                  <TableCell>{targetField}</TableCell>
                  <TableCell>{sourceColumn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Sample data */}
      <Typography variant="subtitle1" gutterBottom>Sample Data Preview</Typography>
      <Paper sx={{ mb: 3 }}>
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Record #</TableCell>
                {Object.keys(validMappings).slice(0, 8).map(field => (
                  <TableCell key={field}>{field}</TableCell>
                ))}
                {Object.keys(validMappings).length > 8 && <TableCell>...</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  {Object.keys(validMappings).slice(0, 8).map(field => (
                    <TableCell key={field}>{row[field]}</TableCell>
                  ))}
                  {Object.keys(validMappings).length > 8 && <TableCell>...</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onContinue}
          startIcon={<CheckCircleIcon />}
          disabled={mappedFieldCount === 0}
        >
          Import Data
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewStep;
