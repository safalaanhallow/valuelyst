import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  Slider,
  Rating
} from '@mui/material';

const AccessibilityLocation = ({ formik }) => {
  // Ensure values is initialized
  const values = formik.values || {};
  
  // Helper function to create the fully qualified field name with prefix
  const fieldName = (name) => `accessibility.${name}`;

  // Helper to handle onChange for this component
  const handleChange = (e) => {
    formik.handleChange(e);
  };
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Accessibility & Location Features
      </Typography>
      <Typography variant="body2" paragraph>
        Collect information about the property's accessibility, proximity to amenities and transportation.
      </Typography>

      <Grid container spacing={3}>
        {/* Transportation & Access */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Transportation & Access</Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="walkScore"
            name={fieldName('walkScore')}
            label="Walk Score (0-100)"
            type="number"
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            value={values.walkScore || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="transitScore"
            name={fieldName('transitScore')}
            label="Transit Score (0-100)"
            type="number"
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            value={values.transitScore || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="distanceToHighway"
            name={fieldName('distanceToHighway')}
            label="Distance to Highway (miles)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={values.distanceToHighway || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="distanceToAirport"
            name={fieldName('distanceToAirport')}
            label="Distance to Airport (miles)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={values.distanceToAirport || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Accessibility Features</FormLabel>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('accessibilityFeatures.adaCompliant')}
                    checked={values.accessibilityFeatures?.adaCompliant || false}
                    onChange={handleChange}
                  />
                }
                label="ADA Compliant"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('accessibilityFeatures.wheelchairRamps')}
                    checked={values.accessibilityFeatures?.wheelchairRamps || false}
                    onChange={handleChange}
                  />
                }
                label="Wheelchair Ramps"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('accessibilityFeatures.accessibleParking')}
                    checked={values.accessibilityFeatures?.accessibleParking || false}
                    onChange={handleChange}
                  />
                }
                label="Accessible Parking"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('accessibilityFeatures.accessibleRestrooms')}
                    checked={values.accessibilityFeatures?.accessibleRestrooms || false}
                    onChange={handleChange}
                  />
                }
                label="Accessible Restrooms"
              />
            </FormGroup>
          </FormControl>
        </Grid>

        {/* Nearby Amenities */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Nearby Amenities</Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box sx={{ px: 1 }}>
            <Typography gutterBottom>Retail Proximity</Typography>
            <Rating
              name="retailProximity"
              value={Number(formik.values.retailProximity) || 0}
              onChange={(event, newValue) => {
                formik.setFieldValue('retailProximity', newValue);
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box sx={{ px: 1 }}>
            <Typography gutterBottom>Restaurant Proximity</Typography>
            <Rating
              name="restaurantProximity"
              value={Number(formik.values.restaurantProximity) || 0}
              onChange={(event, newValue) => {
                formik.setFieldValue('restaurantProximity', newValue);
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box sx={{ px: 1 }}>
            <Typography gutterBottom>Entertainment Proximity</Typography>
            <Rating
              name="entertainmentProximity"
              value={Number(formik.values.entertainmentProximity) || 0}
              onChange={(event, newValue) => {
                formik.setFieldValue('entertainmentProximity', newValue);
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="nearbyAmenities"
            name="nearbyAmenities"
            label="Notable Nearby Amenities"
            multiline
            rows={3}
            value={formik.values.nearbyAmenities || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="locationNotes"
            name="locationNotes"
            label="Location Notes"
            multiline
            rows={3}
            value={formik.values.locationNotes || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        {/* Demographics */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Demographic Data</Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="medianIncomeZip"
            name="medianIncomeZip"
            label="Median Income (ZIP)"
            type="number"
            value={formik.values.medianIncomeZip || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="populationDensity"
            name="populationDensity"
            label="Population Density"
            type="number"
            value={formik.values.populationDensity || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="employmentRate"
            name="employmentRate"
            label="Employment Rate (%)"
            type="number"
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            value={formik.values.employmentRate || ''}
            onChange={formik.handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AccessibilityLocation;
