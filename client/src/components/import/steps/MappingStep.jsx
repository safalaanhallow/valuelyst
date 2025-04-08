import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Alert,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  AutoFixHigh as AutoFixHighIcon,
  FilterList as FilterListIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon
} from '@mui/icons-material';

// TabPanel component for category tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mapping-tabpanel-${index}`}
      aria-labelledby={`mapping-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MappingStep = ({ sourceColumns, targetFields, fieldCategories, mappings, onMappingChange, previewData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTargetFields, setFilteredTargetFields] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState([]);

  // Initialize category list on component mount
  useEffect(() => {
    if (fieldCategories) {
      setCategoryOrder(Object.keys(fieldCategories));
    }
  }, [fieldCategories]);

  // Filter target fields based on search term
  useEffect(() => {
    if (!targetFields) return;
    
    if (!searchTerm) {
      setFilteredTargetFields(targetFields);
      return;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = targetFields.filter(field => 
      field.field.toLowerCase().includes(lowercaseSearch) ||
      field.category.toLowerCase().includes(lowercaseSearch)
    );
    
    setFilteredTargetFields(filtered);
  }, [searchTerm, targetFields]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Auto-map all fields that match by name
  const handleAutoMapAll = () => {
    // This is handled by the parent component
  };

  // Clear all mappings
  const handleClearAllMappings = () => {
    const clearedMappings = {};
    Object.keys(mappings).forEach(key => {
      clearedMappings[key] = '';
    });
    
    Object.keys(clearedMappings).forEach(field => {
      onMappingChange(field, '');
    });
  };

  // Get mapped field count
  const getMappedFieldCount = () => {
    return Object.values(mappings).filter(Boolean).length;
  };

  // Render preview data table
  const renderPreviewTable = () => {
    if (!previewData || previewData.length === 0) return null;
    
    const columns = Object.keys(previewData[0]).slice(0, 10); // Limit to first 10 columns for preview
    
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="subtitle2">#</Typography></TableCell>
              {columns.map(column => (
                <TableCell key={column}>
                  <Typography variant="subtitle2">{column}</Typography>
                </TableCell>
              ))}
              {Object.keys(previewData[0]).length > 10 && (
                <TableCell>
                  <Typography variant="subtitle2">...</Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{rowIndex + 1}</TableCell>
                {columns.map(column => (
                  <TableCell key={`${rowIndex}-${column}`}>
                    {row[column]}
                  </TableCell>
                ))}
                {Object.keys(previewData[0]).length > 10 && (
                  <TableCell>...</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render mapping interface for a category
  const renderCategoryFields = (category) => {
    if (!fieldCategories || !fieldCategories[category]) return null;
    
    const fields = searchTerm
      ? filteredTargetFields.filter(field => field.category === category).map(field => field.field)
      : fieldCategories[category];
    
    if (fields.length === 0) return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No fields match your search in this category
      </Alert>
    );
    
    return (
      <Grid container spacing={3}>
        {fields.map(field => (
          <Grid item xs={12} sm={6} md={4} key={field}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id={`mapping-label-${field}`}>{field}</InputLabel>
              <Select
                labelId={`mapping-label-${field}`}
                value={mappings[field] || ''}
                onChange={(e) => onMappingChange(field, e.target.value)}
                label={field}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
                endAdornment={
                  mappings[field] && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onMappingChange(field, '');
                        }}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {sourceColumns.map(column => (
                  <MenuItem key={column} value={column}>
                    {column}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Map CSV Fields to Property Data</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Map columns from your CSV file to the appropriate property fields. The system will attempt to match fields automatically.
        You can refine the mappings using the search and filter options below.
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Fields"
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} edge="end" size="small">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`${getMappedFieldCount()} fields mapped`} 
                color="primary" 
                variant="outlined" 
                sx={{ mr: 2 }} 
              />
              <Typography variant="body2" color="text.secondary">
                out of {Object.keys(mappings).length} available fields
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                startIcon={<LinkOffIcon />} 
                onClick={handleClearAllMappings} 
                sx={{ mr: 1 }}
                size="small"
              >
                Clear All
              </Button>
              <Button 
                startIcon={<AutoFixHighIcon />} 
                onClick={handleAutoMapAll}
                variant="outlined"
                size="small"
              >
                Auto-Map
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography variant="subtitle1" gutterBottom>CSV Data Preview</Typography>
      {renderPreviewTable()}
      
      <Typography variant="subtitle1" gutterBottom>Field Mapping</Typography>
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {categoryOrder.map((category, index) => (
            <Tab key={category} label={category} id={`mapping-tab-${index}`} />
          ))}
          <Tab label="All Fields" id="mapping-tab-all" />
        </Tabs>
        
        {categoryOrder.map((category, index) => (
          <TabPanel value={activeTab} index={index} key={category}>
            <Box sx={{ p: 2 }}>
              {renderCategoryFields(category)}
            </Box>
          </TabPanel>
        ))}
        
        <TabPanel value={activeTab} index={categoryOrder.length}>
          <Box sx={{ p: 2 }}>
            {/* Accordion view for all categories */}
            {categoryOrder.map(category => (
              <Accordion key={category}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{category}</Typography>
                  <Chip 
                    label={`${Object.entries(mappings).filter(([field, value]) => 
                      fieldCategories[category]?.includes(field) && value
                    ).length} mapped`} 
                    size="small" 
                    variant="outlined" 
                    sx={{ ml: 2 }} 
                  />
                </AccordionSummary>
                <AccordionDetails>
                  {renderCategoryFields(category)}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default MappingStep;
