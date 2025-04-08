import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Box,
  MenuItem,
  InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your actual Mapbox token
const MAPBOX_TOKEN = 'pk.placeholder-token-replace-with-actual-mapbox-token';

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

const IdentificationTab = ({ formik }) => {
  const [viewport, setViewport] = useState({
    latitude: formik.values.latitude || 40.7128,
    longitude: formik.values.longitude || -74.0060,
    zoom: 12
  });

  const handleMapClick = (event) => {
    const { lngLat } = event;
    formik.setFieldValue('longitude', lngLat.lng);
    formik.setFieldValue('latitude', lngLat.lat);
    setViewport({
      ...viewport,
      latitude: lngLat.lat,
      longitude: lngLat.lng
    });
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Property Identification
      </Typography>
      <Grid container spacing={3}>
        {/* APN Field with regex validation */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="apn"
            name="apn"
            label={<RequiredLabel label="APN (Assessor's Parcel Number)" />}
            value={formik.values.apn}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.apn && Boolean(formik.errors.apn)}
            helperText={formik.touched.apn && formik.errors.apn}
            placeholder="123-456-789"
          />
        </Grid>

        {/* Last Sale Date */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={<RequiredLabel label="Last Sale Date" />}
              value={formik.values.lastSaleDate}
              onChange={(newValue) => {
                formik.setFieldValue('lastSaleDate', newValue);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  id: "lastSaleDate",
                  name: "lastSaleDate",
                  error: formik.touched.lastSaleDate && Boolean(formik.errors.lastSaleDate),
                  helperText: formik.touched.lastSaleDate && formik.errors.lastSaleDate
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Lat/Long with Map Picker */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="latitude"
            name="latitude"
            label="Latitude"
            type="number"
            value={formik.values.latitude}
            onChange={(e) => {
              formik.handleChange(e);
              setViewport({
                ...viewport,
                latitude: parseFloat(e.target.value) || 0,
              });
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.latitude && Boolean(formik.errors.latitude)}
            helperText={formik.touched.latitude && formik.errors.latitude}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="longitude"
            name="longitude"
            label="Longitude"
            type="number"
            value={formik.values.longitude}
            onChange={(e) => {
              formik.handleChange(e);
              setViewport({
                ...viewport,
                longitude: parseFloat(e.target.value) || 0,
              });
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.longitude && Boolean(formik.errors.longitude)}
            helperText={formik.touched.longitude && formik.errors.longitude}
          />
        </Grid>

        {/* Address Fields */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 2 }}>
            Property Address Information
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="streetAddress"
            name="streetAddress"
            label={<RequiredLabel label="Street Address" />}
            value={formik.values.streetAddress || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.streetAddress && Boolean(formik.errors.streetAddress)}
            helperText={formik.touched.streetAddress && formik.errors.streetAddress}
            placeholder="123 Main Street"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="city"
            name="city"
            label={<RequiredLabel label="City" />}
            value={formik.values.city || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.city && Boolean(formik.errors.city)}
            helperText={formik.touched.city && formik.errors.city}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="state"
            name="state"
            label={<RequiredLabel label="State" />}
            value={formik.values.state || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.state && Boolean(formik.errors.state)}
            helperText={formik.touched.state && formik.errors.state}
            select
          >
            {US_STATES.map((state) => (
              <MenuItem key={state.abbreviation} value={state.abbreviation}>
                {state.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="zipCode"
            name="zipCode"
            label={<RequiredLabel label="Zip Code" />}
            value={formik.values.zipCode || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
            helperText={formik.touched.zipCode && formik.errors.zipCode}
            inputProps={{ maxLength: 10 }}
            placeholder="12345" 
          />
        </Grid>

        {/* Map Picker */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Or click on the map to set location
          </Typography>
          <Box sx={{ height: 400, width: '100%', borderRadius: '4px', overflow: 'hidden' }}>
            <Map
              {...viewport}
              mapboxAccessToken={MAPBOX_TOKEN}
              width="100%"
              height="100%"
              mapStyle="mapbox://styles/mapbox/streets-v11"
              onViewportChange={setViewport}
              onClick={handleMapClick}
            >
              {formik.values.latitude && formik.values.longitude && (
                <Marker
                  latitude={formik.values.latitude}
                  longitude={formik.values.longitude}
                  offsetLeft={-20}
                  offsetTop={-10}
                >
                  <div style={{ color: 'red', fontSize: '24px' }}>📍</div>
                </Marker>
              )}
            </Map>
          </Box>
        </Grid>

        {/* Additional Identification Fields could be added here */}
        {/* For example: Property Name, Address, City, etc. */}
      </Grid>
    </Paper>
  );
};

export default IdentificationTab;
