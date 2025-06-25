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
            name="accessibility.walkScore"
            label="Walk Score (0-100)"
            type="number"
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            value={formik.values.accessibility.walkScore || ''}
            onChange={formik.handleChange}
            error={formik.touched.accessibility?.walkScore && Boolean(formik.errors.accessibility?.walkScore)}
            helperText={formik.touched.accessibility?.walkScore && formik.errors.accessibility?.walkScore}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="transitScore"
            name="accessibility.transitScore"
            label="Transit Score (0-100)"
            type="number"
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            value={formik.values.accessibility.transitScore || ''}
            onChange={formik.handleChange}
            error={formik.touched.accessibility?.transitScore && Boolean(formik.errors.accessibility?.transitScore)}
            helperText={formik.touched.accessibility?.transitScore && formik.errors.accessibility?.transitScore}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="distanceToHighway"
            name="accessibility.distanceToHighway"
            label="Distance to Highway (miles)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={formik.values.accessibility.distanceToHighway || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="distanceToAirport"
            name="accessibility.distanceToAirport"
            label="Distance to Airport (miles)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={formik.values.accessibility.distanceToAirport || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Accessibility Features</FormLabel>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox 
                    name="accessibility.accessibilityFeatures.adaCompliant"
                    checked={formik.values.accessibility.accessibilityFeatures?.adaCompliant || false}
                    onChange={formik.handleChange}
                  />
                }
                label="ADA Compliant"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="accessibility.accessibilityFeatures.wheelchairRamps"
                    checked={formik.values.accessibility.accessibilityFeatures?.wheelchairRamps || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Wheelchair Ramps"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="accessibility.accessibilityFeatures.accessibleParking"
                    checked={formik.values.accessibility.accessibilityFeatures?.accessibleParking || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Accessible Parking"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="accessibility.accessibilityFeatures.accessibleRestrooms"
                    checked={formik.values.accessibility.accessibilityFeatures?.accessibleRestrooms || false}
                    onChange={formik.handleChange}
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
              name="accessibility.retailProximity"
              value={Number(formik.values.accessibility.retailProximity) || 0}
              onChange={(event, newValue) => {
                formik.setFieldValue('accessibility.retailProximity', newValue);
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box sx={{ px: 1 }}>
            <Typography gutterBottom>Restaurant Proximity</Typography>
            <Rating
              name="accessibility.restaurantProximity"
              value={Number(formik.values.accessibility.restaurantProximity) || 0}
              onChange={(event, newValue) => {
                formik.setFieldValue('accessibility.restaurantProximity', newValue);
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box sx={{ px: 1 }}>
            <Typography gutterBottom>Entertainment Proximity</Typography>
            <Rating
              name="accessibility.entertainmentProximity"
              value={Number(formik.values.accessibility.entertainmentProximity) || 0}
              onChange={(event, newValue) => {
                formik.setFieldValue('accessibility.entertainmentProximity', newValue);
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="nearbyAmenities"
            name="accessibility.nearbyAmenities"
            label="Notable Nearby Amenities"
            multiline
            rows={3}
            value={formik.values.accessibility.nearbyAmenities || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="locationNotes"
            name="accessibility.locationNotes"
            label="Location Notes"
            multiline
            rows={3}
            value={formik.values.accessibility.locationNotes || ''}
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
            name="accessibility.medianIncomeZip"
            label="Median Income (ZIP)"
            type="number"
            value={formik.values.accessibility.medianIncomeZip || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="populationDensity"
            name="accessibility.populationDensity"
            label="Population Density"
            type="number"
            value={formik.values.accessibility.populationDensity || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="employmentRate"
            name="accessibility.employmentRate"
            label="Employment Rate (%)"
            type="number"
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            value={formik.values.accessibility.employmentRate || ''}
            onChange={formik.handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AccessibilityLocation;
