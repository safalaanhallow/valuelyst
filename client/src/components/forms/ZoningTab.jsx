import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  Box,
  FormHelperText
} from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Sample overlay zones (these could come from an API in a real app)
const overlayZonesOptions = [
  'Historic District',
  'Downtown Overlay',
  'Transit Oriented Development',
  'Mixed Use',
  'Arts District',
  'River Corridor',
  'Airport Overlay',
  'Growth Management',
  'Environmental Protection',
  'Affordable Housing',
];

// Sample parking types
const parkingTypes = [
  'Surface Lot',
  'Parking Structure',
  'Underground Garage',
  'Street Parking',
  'None',
];

const ZoningTab = ({ formik }) => {
  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Zoning Information
      </Typography>
      <Grid container spacing={3}>
        {/* Multi-select for Overlay Zones */}
        <Grid item xs={12}>
          <FormControl 
            fullWidth
            error={formik.touched.overlayZones && Boolean(formik.errors.overlayZones)}
          >
            <InputLabel id="overlay-zones-label">Overlay Zones</InputLabel>
            <Select
              labelId="overlay-zones-label"
              id="overlayZones"
              name="overlayZones"
              multiple
              value={formik.values.overlayZones || []}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              input={<OutlinedInput id="select-multiple-chip" label="Overlay Zones" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {overlayZonesOptions.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  {zone}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.overlayZones && formik.errors.overlayZones && (
              <FormHelperText>{formik.errors.overlayZones}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Setbacks */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="frontSetback"
            name="frontSetback"
            label="Front Setback (ft)"
            type="number"
            value={formik.values.frontSetback}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.frontSetback && Boolean(formik.errors.frontSetback)}
            helperText={formik.touched.frontSetback && formik.errors.frontSetback}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="rearSetback"
            name="rearSetback"
            label="Rear Setback (ft)"
            type="number"
            value={formik.values.rearSetback}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.rearSetback && Boolean(formik.errors.rearSetback)}
            helperText={formik.touched.rearSetback && formik.errors.rearSetback}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="sideSetback"
            name="sideSetback"
            label="Side Setback (ft)"
            type="number"
            value={formik.values.sideSetback}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.sideSetback && Boolean(formik.errors.sideSetback)}
            helperText={formik.touched.sideSetback && formik.errors.sideSetback}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        {/* Dropdown for Parking Types */}
        <Grid item xs={12} sm={6}>
          <FormControl 
            fullWidth
            error={formik.touched.parkingType && Boolean(formik.errors.parkingType)}
          >
            <InputLabel id="parking-type-label">Parking Type</InputLabel>
            <Select
              labelId="parking-type-label"
              id="parkingType"
              name="parkingType"
              value={formik.values.parkingType || ''}
              label="Parking Type"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {parkingTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.parkingType && formik.errors.parkingType && (
              <FormHelperText>{formik.errors.parkingType}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        {/* Additional Zoning Fields could be added here */}
        {/* For example: Primary Zoning Designation, FAR, Height Restrictions, etc. */}
      </Grid>
    </Paper>
  );
};

export default ZoningTab;
