import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Function to calculate contrast color based on background
const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Function to generate a color based on tenant type
const getTenantColor = (tenantType) => {
  const colors = {
    'Commercial': '#4285F4', // Blue
    'Retail': '#EA4335',     // Red
    'Industrial': '#FBBC05',  // Yellow
    'Office': '#34A853',     // Green
    'Medical': '#9C27B0',    // Purple
    'Restaurant': '#FF9800',  // Orange
    'Warehouse': '#795548',  // Brown
    'Mixed Use': '#607D8B',  // Blue Grey
    'Other': '#9E9E9E',      // Grey
  };
  
  return colors[tenantType] || '#9E9E9E';
};

const LeaseTimeline = ({ open, onClose, tenants }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [filter, setFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  
  // Prepare data for timeline display
  useEffect(() => {
    if (tenants && tenants.length > 0) {
      let filtered = [...tenants];
      
      // Apply tenant type filter
      if (filter !== 'all') {
        filtered = filtered.filter(tenant => tenant.tenantType === filter);
      }
      
      // Apply floor filter
      if (floorFilter !== 'all') {
        filtered = filtered.filter(tenant => tenant.floorNumber === floorFilter);
      }
      
      setFilteredTenants(filtered);
    } else {
      setFilteredTenants([]);
    }
  }, [tenants, filter, floorFilter]);
  
  // Get unique tenant types and floors for filters
  const tenantTypes = tenants ? ['all', ...new Set(tenants.map(tenant => tenant.tenantType).filter(Boolean))] : ['all'];
  const floorNumbers = tenants ? ['all', ...new Set(tenants.map(tenant => tenant.floorNumber).filter(Boolean))] : ['all'];
  
  // Generate timeline
  const generateTimeline = () => {
    if (!filteredTenants || filteredTenants.length === 0) {
      return <Typography>No lease data available for timeline visualization.</Typography>;
    }
    
    // Find the earliest start date and latest end date
    const allDates = filteredTenants.flatMap(tenant => [
      new Date(tenant.leaseStartDate),
      new Date(tenant.leaseEndDate)
    ]).filter(date => !isNaN(date.getTime()));
    
    if (allDates.length === 0) {
      return <Typography>No valid lease dates available.</Typography>;
    }
    
    const earliestDate = new Date(Math.min(...allDates.map(date => date.getTime())));
    const latestDate = new Date(Math.max(...allDates.map(date => date.getTime())));
    
    // Calculate total timeline duration in months
    const totalMonths = (latestDate.getFullYear() - earliestDate.getFullYear()) * 12 + 
                         (latestDate.getMonth() - earliestDate.getMonth()) + 1;
    
    // Current date for highlighting
    const currentDate = new Date();
    
    // Render lease bars
    return (
      <Box sx={{ overflowX: 'auto', mb: 2 }}>
        <Box sx={{ position: 'relative', height: filteredTenants.length * 60 + 100, 
                   width: `${totalMonths * 40 * zoomLevel}px`, minWidth: '100%' }}>
          {/* Timeline header - years and months */}
          <Box sx={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', 
                     borderBottom: '1px solid #ddd', zIndex: 2, height: 50 }}>
            {Array.from({ length: totalMonths + 1 }).map((_, index) => {
              const date = new Date(earliestDate);
              date.setMonth(earliestDate.getMonth() + index);
              const isYearStart = date.getMonth() === 0 || 
                                (index === 0 && date.getMonth() !== 0);
              
              return (
                <Box key={index} sx={{
                  position: 'absolute',
                  left: `${index * 40 * zoomLevel}px`,
                  top: isYearStart ? 0 : 25,
                  width: 40 * zoomLevel,
                  height: isYearStart ? 50 : 25,
                  borderLeft: '1px solid #ddd',
                  textAlign: 'center',
                  fontSize: isYearStart ? 14 : 12,
                  whiteSpace: 'nowrap',
                }}>
                  {isYearStart && <div>{date.getFullYear()}</div>}
                  <div>{date.toLocaleString('default', { month: 'short' })}</div>
                </Box>
              );
            })}
          </Box>
          
          {/* Current date line */}
          {currentDate >= earliestDate && currentDate <= latestDate && (
            <Box sx={{
              position: 'absolute',
              left: `${((currentDate - earliestDate) / (1000 * 60 * 60 * 24 * 30.5)) * 40 * zoomLevel}px`,
              top: 50,
              bottom: 0,
              width: 2,
              backgroundColor: 'red',
              zIndex: 1,
            }} />
          )}
          
          {/* Tenant lease bars */}
          {filteredTenants.map((tenant, tenantIndex) => {
            if (!tenant.leaseStartDate || !tenant.leaseEndDate) return null;
            
            const startDate = new Date(tenant.leaseStartDate);
            const endDate = new Date(tenant.leaseEndDate);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
            
            const startMonth = (startDate.getFullYear() - earliestDate.getFullYear()) * 12 + 
                              (startDate.getMonth() - earliestDate.getMonth());
            const endMonth = (endDate.getFullYear() - earliestDate.getFullYear()) * 12 + 
                            (endDate.getMonth() - earliestDate.getMonth());
            const duration = endMonth - startMonth + 1;
            
            const renewalDate = tenant.renewalNoticeDate ? new Date(tenant.renewalNoticeDate) : null;
            const hasRenewalMarker = renewalDate && renewalDate >= earliestDate && renewalDate <= endDate;
            const renewalMonth = hasRenewalMarker ? 
              (renewalDate.getFullYear() - earliestDate.getFullYear()) * 12 + 
              (renewalDate.getMonth() - earliestDate.getMonth()) : null;
            
            const barColor = getTenantColor(tenant.tenantType);
            const textColor = getContrastColor(barColor);
            
            return (
              <Box key={tenantIndex} sx={{ position: 'relative' }}>
                {/* Tenant name column */}
                <Box sx={{
                  position: 'absolute',
                  left: 0,
                  top: 60 + tenantIndex * 60,
                  width: 150,
                  height: 40,
                  backgroundColor: '#f5f5f5',
                  borderRight: '1px solid #ddd',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  zIndex: 3,
                  overflowX: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  <Tooltip title={`${tenant.tenantName} (${tenant.suiteNumber || 'No Suite'})`}>
                    <span>{tenant.tenantName}</span>
                  </Tooltip>
                </Box>
                
                {/* Lease bar */}
                <Tooltip 
                  title={
                    <React.Fragment>
                      <Typography variant="subtitle2">{tenant.tenantName}</Typography>
                      <Typography variant="body2">Suite: {tenant.suiteNumber || 'N/A'}</Typography>
                      <Typography variant="body2">Type: {tenant.tenantType}</Typography>
                      <Typography variant="body2">Area: {tenant.leasedArea} SF</Typography>
                      <Typography variant="body2">
                        Term: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        Duration: {duration} months
                      </Typography>
                      {hasRenewalMarker && (
                        <Typography variant="body2">
                          Renewal Notice: {renewalDate.toLocaleDateString()}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                >
                  <Box sx={{
                    position: 'absolute',
                    left: `${startMonth * 40 * zoomLevel + 150}px`,
                    top: 60 + tenantIndex * 60,
                    width: `${duration * 40 * zoomLevel}px`,
                    height: 40,
                    backgroundColor: barColor,
                    color: textColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    zIndex: 1,
                    overflowX: 'hidden',
                    whiteSpace: 'nowrap',
                    fontSize: 12,
                  }}>
                    {zoomLevel >= 0.75 && duration > 3 && `${tenant.tenantName} - ${duration} months`}
                  </Box>
                </Tooltip>
                
                {/* Renewal notice marker */}
                {hasRenewalMarker && (
                  <Tooltip title={`Renewal Notice Date: ${renewalDate.toLocaleDateString()}`}>
                    <Box sx={{
                      position: 'absolute',
                      left: `${renewalMonth * 40 * zoomLevel + 150}px`,
                      top: 50 + tenantIndex * 60,
                      width: 2,
                      height: 60,
                      backgroundColor: 'black',
                      zIndex: 2,
                    }} />
                  </Tooltip>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Lease Timeline Visualization</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Filter controls */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="tenant-type-filter-label">Filter by Tenant Type</InputLabel>
              <Select
                labelId="tenant-type-filter-label"
                value={filter}
                label="Filter by Tenant Type"
                onChange={(e) => setFilter(e.target.value)}
                startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                {tenantTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === 'all' ? 'All Tenant Types' : type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="floor-filter-label">Filter by Floor</InputLabel>
              <Select
                labelId="floor-filter-label"
                value={floorFilter}
                label="Filter by Floor"
                onChange={(e) => setFloorFilter(e.target.value)}
                startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                {floorNumbers.map((floor) => (
                  <MenuItem key={floor} value={floor}>
                    {floor === 'all' ? 'All Floors' : `Floor ${floor}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Zoom controls */}
          <Grid item xs={12} sm={4}>
            <Box display="flex" justifyContent="flex-end" alignItems="center">
              <Typography variant="body2" sx={{ mr: 1 }}>Zoom:</Typography>
              <IconButton 
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                disabled={zoomLevel <= 0.5}
                size="small"
              >
                <ZoomOutIcon />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>{zoomLevel.toFixed(2)}x</Typography>
              <IconButton 
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                disabled={zoomLevel >= 2}
                size="small"
              >
                <ZoomInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        <Paper elevation={2} sx={{ p: 2, position: 'relative' }}>
          <Box sx={{ ml: 150 }} /> {/* Space for tenant names column */}
          {generateTimeline()}
          
          {/* Legend */}
          <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Legend
              <Tooltip title="The timeline shows lease terms for each tenant with color-coding by tenant type. The vertical red line represents the current date, and black markers indicate renewal notice dates.">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Object.entries(tenantTypes.reduce((acc, type) => {
                if (type !== 'all') acc[type] = getTenantColor(type);
                return acc;
              }, {})).map(([type, color]) => (
                <Box key={type} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 20, 
                      height: 20, 
                      backgroundColor: color,
                      borderRadius: 1,
                      mr: 1 
                    }} 
                  />
                  <Typography variant="body2">{type}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 2, 
                    height: 20, 
                    backgroundColor: 'red',
                    mr: 1 
                  }} 
                />
                <Typography variant="body2">Current Date</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 2, 
                    height: 20, 
                    backgroundColor: 'black',
                    mr: 1 
                  }} 
                />
                <Typography variant="body2">Renewal Notice Date</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaseTimeline;
