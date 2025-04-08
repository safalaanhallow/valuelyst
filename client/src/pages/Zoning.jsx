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
  InputAdornment
} from '@mui/material';

const Zoning = ({ formik }) => {
  // Ensure values is initialized
  const values = formik.values || {};
  
  // Helper function to create the fully qualified field name with prefix
  const fieldName = (name) => `zoning.${name}`;

  // Helper to handle onChange for this component
  const handleChange = (e) => {
    // For fields that need special handling, we can intercept here
    if (e.target.name === fieldName('landAreaSqFt') && values.landArea) {
      // If updating square feet, also update acres
      const sfValue = parseFloat(e.target.value);
      if (!isNaN(sfValue)) {
        formik.setFieldValue(fieldName('landArea'), (sfValue / 43560).toFixed(2));
      }
    }
    formik.handleChange(e);
  };
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Zoning Information
      </Typography>
      <Typography variant="body2" paragraph>
        Enter zoning and land use information for the property.
      </Typography>

      <Grid container spacing={3}>
        {/* Basic Zoning Information */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="zoningCode"
            name={fieldName('zoningCode')}
            label="Zoning Code"
            value={values.zoningCode || ''}
            onChange={handleChange}
            error={formik.touched.zoningCode && Boolean(formik.errors.zoningCode)}
            helperText={formik.touched.zoningCode && formik.errors.zoningCode}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="zoning-classification-label">Zoning Classification</InputLabel>
            <Select
              labelId="zoning-classification-label"
              id="zoningClassification"
              name={fieldName('zoningClassification')}
              value={values.zoningClassification || ''}
              onChange={handleChange}
              label="Zoning Classification"
            >
              <MenuItem value=""><em>Select Classification</em></MenuItem>
              <MenuItem value="residential">Residential</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
              <MenuItem value="industrial">Industrial</MenuItem>
              <MenuItem value="agricultural">Agricultural</MenuItem>
              <MenuItem value="mixed">Mixed Use</MenuItem>
              <MenuItem value="special">Special Purpose</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="current-use-label">Current Use</InputLabel>
            <Select
              labelId="current-use-label"
              id="currentUse"
              name={fieldName('currentUse')}
              value={values.currentUse || ''}
              onChange={handleChange}
              label="Current Use"
            >
              <MenuItem value=""><em>Select Current Use</em></MenuItem>
              <MenuItem value="office">Office</MenuItem>
              <MenuItem value="retail">Retail</MenuItem>
              <MenuItem value="industrial">Industrial</MenuItem>
              <MenuItem value="multifamily">Multifamily</MenuItem>
              <MenuItem value="singlefamily">Single Family</MenuItem>
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="mixeduse">Mixed Use</MenuItem>
              <MenuItem value="vacant">Vacant</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="permitableUses"
            name={fieldName('permitableUses')}
            label="Permitable Uses"
            multiline
            rows={1}
            value={values.permitableUses || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Land Metrics */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Land Metrics
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="landArea"
            name={fieldName('landArea')}
            label="Land Area (Acres)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            value={values.landArea || ''}
            onChange={handleChange}
            error={formik.touched.landArea && Boolean(formik.errors.landArea)}
            helperText={formik.touched.landArea && formik.errors.landArea}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="landAreaSqFt"
            name={fieldName('landAreaSqFt')}
            label="Land Area (Square Feet)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={values.landAreaSqFt || (values.landArea ? values.landArea * 43560 : '')}
            onChange={(e) => {
              formik.handleChange(e);
              // Update acres when square feet change
              if (e.target.value) {
                formik.setFieldValue('landArea', (parseFloat(e.target.value) / 43560).toFixed(4));
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="maxHeightAllowed"
            name={fieldName('maxHeightAllowed')}
            label="Maximum Height Allowed (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={values.maxHeightAllowed || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="maxBuildingCoverage"
            name={fieldName('maxBuildingCoverage')}
            label="Maximum Building Coverage (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100 }
            }}
            value={values.maxBuildingCoverage || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="floorAreaRatio"
            name={fieldName('floorAreaRatio')}
            label="Floor Area Ratio (FAR)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={values.floorAreaRatio || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="maxDensity"
            name={fieldName('maxDensity')}
            label="Maximum Density (Units/Acre)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={values.maxDensity || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Setbacks */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Required Setbacks
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            id="setbacks.front"
            name={fieldName('setbacks.front')}
            label="Front Setback (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={values.setbacks?.front || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            id="setbacks.rear"
            name={fieldName('setbacks.rear')}
            label="Rear Setback (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={values.setbacks?.rear || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            id="setbacks.leftSide"
            name={fieldName('setbacks.leftSide')}
            label="Left Side Setback (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={values.setbacks?.leftSide || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            id="setbacks.rightSide"
            name={fieldName('setbacks.rightSide')}
            label="Right Side Setback (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={values.setbacks?.rightSide || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Parking Requirements */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Parking Requirements
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="parkingRequirements.commercial"
            name={fieldName('parkingRequirements.commercial')}
            label="Commercial Ratio (per 1,000 SF)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={values.parkingRequirements?.commercial || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="parkingRequirements.residential"
            name={fieldName('parkingRequirements.residential')}
            label="Residential Ratio (per Unit)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={values.parkingRequirements?.residential || ''}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="parkingRequirements.accessible"
            name={fieldName('parkingRequirements.accessible')}
            label="Required Accessible Spaces"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={values.parkingRequirements?.accessible || ''}
            onChange={handleChange}
          />
        </Grid>

        {/* Zoning Restrictions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Zoning Restrictions & Compliance
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Zoning Status</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('zoningStatus.conforming')}
                    checked={values.zoningStatus?.conforming || false}
                    onChange={handleChange}
                  />
                }
                label="Conforming Use"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('zoningStatus.nonconforming')}
                    checked={values.zoningStatus?.nonconforming || false}
                    onChange={handleChange}
                  />
                }
                label="Legal Non-Conforming Use"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('zoningStatus.variance')}
                    checked={values.zoningStatus?.variance || false}
                    onChange={handleChange}
                  />
                }
                label="Zoning Variance Granted"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('zoningStatus.specialUse')}
                    checked={values.zoningStatus?.specialUse || false}
                    onChange={handleChange}
                  />
                }
                label="Special Use Permit"
              />
            </FormGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Future Development</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('futureDevelopment.rezoning')}
                    checked={values.futureDevelopment?.rezoning || false}
                    onChange={handleChange}
                  />
                }
                label="Rezoning Potential"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('futureDevelopment.expansionPotential')}
                    checked={values.futureDevelopment?.expansionPotential || false}
                    onChange={handleChange}
                  />
                }
                label="Expansion Potential"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('futureDevelopment.denseUsePotential')}
                    checked={values.futureDevelopment?.denseUsePotential || false}
                    onChange={handleChange}
                  />
                }
                label="Potential for More Dense Use"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('futureDevelopment.inOpportunityZone')}
                    checked={values.futureDevelopment?.inOpportunityZone || false}
                    onChange={handleChange}
                  />
                }
                label="In Opportunity Zone"
              />
            </FormGroup>
          </FormControl>
        </Grid>

        {/* Additional Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="zoningNotes"
            name={fieldName('zoningNotes')}
            label="Additional Zoning Notes"
            multiline
            rows={3}
            value={values.zoningNotes || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Zoning;
