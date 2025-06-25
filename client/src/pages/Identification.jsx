import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Box,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your actual Mapbox token
const MAPBOX_TOKEN = 'pk.placeholder-token-replace-with-actual-mapbox-token';

// Property Types for classification
const PROPERTY_TYPES = [
  { name: 'Retail', subtypes: ['Shopping Center', 'Strip Mall', 'Big Box', 'Restaurant', 'Storefront'] },
  { name: 'Multifamily', subtypes: ['Garden', 'Mid-Rise', 'High-Rise', 'Senior Housing', 'Student Housing'] },
  { name: 'Office', subtypes: ['Class A', 'Class B', 'Class C', 'Medical', 'Flex'] },
  { name: 'Industrial', subtypes: ['Warehouse', 'Manufacturing', 'Flex', 'R&D', 'Distribution'] },
  { name: 'Agricultural', subtypes: ['Cropland', 'Pasture', 'Orchard', 'Vineyard', 'Timberland'] },
  { name: 'Hotel/Hospitality', subtypes: ['Full-Service', 'Limited-Service', 'Resort', 'Extended Stay'] },
  { name: 'Special Purpose', subtypes: ['Religious', 'Self-Storage', 'Healthcare', 'Entertainment', 'Sports'] },
  { name: 'Mixed-Use', subtypes: ['Retail/Office', 'Retail/Residential', 'Office/Residential'] },
  { name: 'Land', subtypes: ['Development', 'Recreational', 'Rural', 'Urban Infill'] }
];

// US States for dropdown
const US_STATES = [
  { name: 'Alabama', abbreviation: 'AL' },
  { name: 'Alaska', abbreviation: 'AK' },
  { name: 'Arizona', abbreviation: 'AZ' },
  { name: 'Arkansas', abbreviation: 'AR' },
  { name: 'California', abbreviation: 'CA' },
  { name: 'Colorado', abbreviation: 'CO' },
  { name: 'Connecticut', abbreviation: 'CT' },
  { name: 'Delaware', abbreviation: 'DE' },
  { name: 'Florida', abbreviation: 'FL' },
  { name: 'Georgia', abbreviation: 'GA' },
  { name: 'Hawaii', abbreviation: 'HI' },
  { name: 'Idaho', abbreviation: 'ID' },
  { name: 'Illinois', abbreviation: 'IL' },
  { name: 'Indiana', abbreviation: 'IN' },
  { name: 'Iowa', abbreviation: 'IA' },
  { name: 'Kansas', abbreviation: 'KS' },
  { name: 'Kentucky', abbreviation: 'KY' },
  { name: 'Louisiana', abbreviation: 'LA' },
  { name: 'Maine', abbreviation: 'ME' },
  { name: 'Maryland', abbreviation: 'MD' },
  { name: 'Massachusetts', abbreviation: 'MA' },
  { name: 'Michigan', abbreviation: 'MI' },
  { name: 'Minnesota', abbreviation: 'MN' },
  { name: 'Mississippi', abbreviation: 'MS' },
  { name: 'Missouri', abbreviation: 'MO' },
  { name: 'Montana', abbreviation: 'MT' },
  { name: 'Nebraska', abbreviation: 'NE' },
  { name: 'Nevada', abbreviation: 'NV' },
  { name: 'New Hampshire', abbreviation: 'NH' },
  { name: 'New Jersey', abbreviation: 'NJ' },
  { name: 'New Mexico', abbreviation: 'NM' },
  { name: 'New York', abbreviation: 'NY' },
  { name: 'North Carolina', abbreviation: 'NC' },
  { name: 'North Dakota', abbreviation: 'ND' },
  { name: 'Ohio', abbreviation: 'OH' },
  { name: 'Oklahoma', abbreviation: 'OK' },
  { name: 'Oregon', abbreviation: 'OR' },
  { name: 'Pennsylvania', abbreviation: 'PA' },
  { name: 'Rhode Island', abbreviation: 'RI' },
  { name: 'South Carolina', abbreviation: 'SC' },
  { name: 'South Dakota', abbreviation: 'SD' },
  { name: 'Tennessee', abbreviation: 'TN' },
  { name: 'Texas', abbreviation: 'TX' },
  { name: 'Utah', abbreviation: 'UT' },
  { name: 'Vermont', abbreviation: 'VT' },
  { name: 'Virginia', abbreviation: 'VA' },
  { name: 'Washington', abbreviation: 'WA' },
  { name: 'West Virginia', abbreviation: 'WV' },
  { name: 'Wisconsin', abbreviation: 'WI' },
  { name: 'Wyoming', abbreviation: 'WY' }
];

// Helper function to create label with required asterisk
const RequiredLabel = ({ label }) => (
  <span>
    {label} <span style={{ color: 'red' }}>*</span>
  </span>
);

const Identification = ({ formik }) => {
  // Safely parse coordinates, providing a default if invalid
  const latitude = parseFloat(formik.values.identification.latitude) || 40.7128;
  const longitude = parseFloat(formik.values.identification.longitude) || -74.0060;

  const [viewport, setViewport] = useState({
    latitude,
    longitude,
    zoom: 12
  });

  // Check if the coordinates from formik are valid numbers for rendering the marker
  const hasValidCoordinates = 
    !isNaN(parseFloat(formik.values.identification.latitude)) &&
    !isNaN(parseFloat(formik.values.identification.longitude));


  const handleMapClick = (event) => {
    const { lngLat } = event;
    formik.setFieldValue('identification.longitude', lngLat.lng);
    formik.setFieldValue('identification.latitude', lngLat.lat);
    setViewport({
      ...viewport,
      latitude: lngLat.lat,
      longitude: lngLat.lng
    });
  };

  

  // Get available subtypes based on selected property type
  const getAvailableSubtypes = () => {
    const selectedType = formik.values.identification.propertyType;
    const typeObject = PROPERTY_TYPES.find(type => type.name === selectedType);
    return typeObject ? typeObject.subtypes : [];
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Property Identification
      </Typography>
      
      {/* Property Type Classification Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Property Type Classification
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {/* Property Type Dropdown */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="property-type-label"><RequiredLabel label="Property Type" /></InputLabel>
              <Select
                labelId="property-type-label"
                id="propertyType"
                name="identification.propertyType"
                value={formik.values.identification.propertyType || ''}
                onChange={formik.handleChange}
                error={formik.touched.identification?.propertyType && Boolean(formik.errors.identification?.propertyType)}
                label={<RequiredLabel label="Property Type" />}
              >
                {PROPERTY_TYPES.map((type) => (
                  <MenuItem key={type.name} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.identification?.propertyType && formik.errors.identification?.propertyType && (
                <Typography variant="caption" color="error">
                  {formik.errors.identification.propertyType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Property Subtype Dropdown - Only visible if a property type is selected */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={!formik.values.identification.propertyType}>
              <InputLabel id="property-subtype-label">Property Subtype</InputLabel>
              <Select
                labelId="property-subtype-label"
                id="propertySubtype"
                name="identification.propertySubtype"
                value={formik.values.identification.propertySubtype || ''}
                onChange={formik.handleChange}
                error={formik.touched.identification?.propertySubtype && Boolean(formik.errors.identification?.propertySubtype)}
                label="Property Subtype"
              >
                {getAvailableSubtypes().map((subtype) => (
                  <MenuItem key={subtype} value={subtype}>
                    {subtype}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.identification?.propertySubtype && formik.errors.identification?.propertySubtype && (
                <Typography variant="caption" color="error">
                  {formik.errors.identification.propertySubtype}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          {/* Custom Property Type / Notes Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="propertyNotes"
              name="identification.propertyNotes"
              label="Additional Property Type Notes"
              multiline
              rows={3}
              value={formik.values.identification.propertyNotes || ''}
              onChange={formik.handleChange}
              error={formik.touched.identification?.propertyNotes && Boolean(formik.errors.identification?.propertyNotes)}
              helperText={formik.touched.identification?.propertyNotes && formik.errors.identification?.propertyNotes ? formik.errors.identification.propertyNotes : 'Provide any additional details about the property type or specific classifications.'}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Property Identification Data Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Property Identification Data
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {/* APN Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="apn"
              name="identification.apn"
              label={<RequiredLabel label="APN (Assessor's Parcel Number)" />}
              value={formik.values.identification.apn || ''}
              onChange={formik.handleChange}
              error={formik.touched.identification?.apn && Boolean(formik.errors.identification?.apn)}
              helperText={formik.touched.identification?.apn && formik.errors.identification?.apn}
            />
          </Grid>

          {/* Last Sale Date Picker */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={<RequiredLabel label="Last Sale Date" />}
                value={formik.values.identification.lastSaleDate}
                onChange={(date) => formik.setFieldValue('identification.lastSaleDate', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.identification?.lastSaleDate && Boolean(formik.errors.identification?.lastSaleDate)}
                    helperText={formik.touched.identification?.lastSaleDate && formik.errors.identification?.lastSaleDate}
                    
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {/* Latitude and Longitude Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="latitude"
              name="identification.latitude"
              label="Latitude"
              type="number"
              value={formik.values.identification.latitude || ''}
              onChange={formik.handleChange}
              error={formik.touched.identification?.latitude && Boolean(formik.errors.identification?.latitude)}
              helperText={formik.touched.identification?.latitude && formik.errors.identification?.latitude}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="longitude"
              name="identification.longitude"
              label="Longitude"
              type="number"
              value={formik.values.identification.longitude || ''}
              onChange={formik.handleChange}
              error={formik.touched.identification?.longitude && Boolean(formik.errors.identification?.longitude)}
              helperText={formik.touched.identification?.longitude && formik.errors.identification?.longitude}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Property Address Information Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Property Address Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {/* Street Address Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="streetAddress"
              name="identification.streetAddress"
              label={<RequiredLabel label="Street Address" />}
              value={formik.values.identification.streetAddress || ''}
              onChange={formik.handleChange}
              error={formik.touched.identification?.streetAddress && Boolean(formik.errors.identification?.streetAddress)}
              helperText={formik.touched.identification?.streetAddress && formik.errors.identification?.streetAddress}
            />
          </Grid>

          {/* City, State, Zip Code Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="city"
              name="identification.city"
              label={<RequiredLabel label="City" />}
              value={formik.values.identification.city || ''}
              onChange={formik.handleChange}
              error={formik.touched.identification?.city && Boolean(formik.errors.identification?.city)}
              helperText={formik.touched.identification?.city && formik.errors.identification?.city}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="state-label"><RequiredLabel label="State" /></InputLabel>
              <Select
                labelId="state-label"
                id="state"
                name="identification.state"
                value={formik.values.identification.state || ''}
                onChange={formik.handleChange}
                error={formik.touched.identification?.state && Boolean(formik.errors.identification?.state)}
                label={<RequiredLabel label="State" />}
              >
                {US_STATES.map((state) => (
                  <MenuItem key={state.abbreviation} value={state.abbreviation}>
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.identification?.state && formik.errors.identification?.state && (
                <Typography variant="caption" color="error">
                  {formik.errors.identification.state}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              id="zipCode"
              name="identification.zipCode"
              label={<RequiredLabel label="Zip Code" />}
              value={formik.values.identification.zipCode || ''}
              onChange={formik.handleChange}
              error={formik.touched.identification?.zipCode && Boolean(formik.errors.identification?.zipCode)}
              helperText={formik.touched.identification?.zipCode && formik.errors.identification?.zipCode}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Map Section */}
      <Box sx={{ height: 400, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Or click on the map to set location
        </Typography>
        <Map
          {...viewport}
          width="100%"
          height="100%"
          mapStyle="mapbox://styles/mapbox/streets-v11"
          onMove={evt => setViewport(evt.viewState)}
          onClick={handleMapClick}
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          {hasValidCoordinates && (
            <Marker 
              longitude={parseFloat(formik.values.identification.longitude)} 
              latitude={parseFloat(formik.values.identification.latitude)} 
            />
          )}
        </Map>
      </Box>
    </Paper>
  );
};

export default Identification;
