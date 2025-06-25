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
            name="zoning.zoningCode"
            label="Zoning Code"
            value={formik.values.zoning.zoningCode || ''}
            onChange={formik.handleChange}
            error={formik.touched.zoning?.zoningCode && Boolean(formik.errors.zoning?.zoningCode)}
            helperText={formik.touched.zoning?.zoningCode && formik.errors.zoning?.zoningCode}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="zoning-classification-label">Zoning Classification</InputLabel>
            <Select
              labelId="zoning-classification-label"
              id="zoningClassification"
              name="zoning.zoningClassification"
              value={formik.values.zoning.zoningClassification || ''}
              onChange={formik.handleChange}
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
              name="zoning.currentUse"
              value={formik.values.zoning.currentUse || ''}
              onChange={formik.handleChange}
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
            name="zoning.permitableUses"
            label="Permitable Uses"
            multiline
            rows={1}
            value={formik.values.zoning.permitableUses || ''}
            onChange={formik.handleChange}
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
            name="zoning.landArea"
            label="Land Area (Acres)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            value={formik.values.zoning.landArea || ''}
            onChange={(e) => {
              formik.handleChange(e);
              const acres = parseFloat(e.target.value);
              if (!isNaN(acres)) {
                formik.setFieldValue('zoning.landAreaSqFt', (acres * 43560).toFixed(0));
              } else {
                formik.setFieldValue('zoning.landAreaSqFt', '');
              }
            }}
            error={formik.touched.zoning?.landArea && Boolean(formik.errors.zoning?.landArea)}
            helperText={formik.touched.zoning?.landArea && formik.errors.zoning?.landArea}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="landAreaSqFt"
            name="zoning.landAreaSqFt"
            label="Land Area (Square Feet)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={formik.values.zoning.landAreaSqFt || ''}
            onChange={(e) => {
              formik.handleChange(e);
              const sqFt = parseFloat(e.target.value);
              if (!isNaN(sqFt)) {
                formik.setFieldValue('zoning.landArea', (sqFt / 43560).toFixed(4));
              } else {
                formik.setFieldValue('zoning.landArea', '');
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="maxHeightAllowed"
            name="zoning.maxHeightAllowed"
            label="Maximum Height Allowed (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={formik.values.zoning.maxHeightAllowed || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="maxBuildingCoverage"
            name="zoning.maxBuildingCoverage"
            label="Maximum Building Coverage (%)"
            type="number"
            InputProps={{ 
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100 }
            }}
            value={formik.values.zoning.maxBuildingCoverage || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="floorAreaRatio"
            name="zoning.floorAreaRatio"
            label="Floor Area Ratio (FAR)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={formik.values.zoning.floorAreaRatio || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="maxDensity"
            name="zoning.maxDensity"
            label="Maximum Density (Units/Acre)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={formik.values.zoning.maxDensity || ''}
            onChange={formik.handleChange}
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
            name="zoning.setbacks.front"
            label="Front Setback (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={formik.values.zoning.setbacks?.front || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            id="setbacks.rear"
            name="zoning.setbacks.rear"
            label="Rear Setback (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={formik.values.zoning.setbacks?.rear || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            id="setbacks.leftSide"
            name="zoning.setbacks.leftSide"
            label="Left Side Setback (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={formik.values.zoning.setbacks?.leftSide || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            id="setbacks.rightSide"
            name="zoning.setbacks.rightSide"
            label="Right Side Setback (ft)"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={formik.values.zoning.setbacks?.rightSide || ''}
            onChange={formik.handleChange}
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
            name="zoning.parkingRequirements.commercial"
            label="Commercial Ratio (per 1,000 SF)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={formik.values.zoning.parkingRequirements?.commercial || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="parkingRequirements.residential"
            name="zoning.parkingRequirements.residential"
            label="Residential Ratio (per Unit)"
            type="number"
            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            value={formik.values.zoning.parkingRequirements?.residential || ''}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            id="parkingRequirements.accessible"
            name="zoning.parkingRequirements.accessible"
            label="Required Accessible Spaces"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={formik.values.zoning.parkingRequirements?.accessible || ''}
            onChange={formik.handleChange}
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
                    name="zoning.zoningStatus.conforming"
                    checked={formik.values.zoning.zoningStatus?.conforming || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Conforming Use"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="zoning.zoningStatus.nonconforming"
                    checked={formik.values.zoning.zoningStatus?.nonconforming || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Legal Non-Conforming Use"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="zoning.zoningStatus.variance"
                    checked={formik.values.zoning.zoningStatus?.variance || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Zoning Variance Granted"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="zoning.zoningStatus.specialUse"
                    checked={formik.values.zoning.zoningStatus?.specialUse || false}
                    onChange={formik.handleChange}
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
                    name="zoning.futureDevelopment.rezoning"
                    checked={formik.values.zoning.futureDevelopment?.rezoning || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Rezoning Potential"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="zoning.futureDevelopment.expansionPotential"
                    checked={formik.values.zoning.futureDevelopment?.expansionPotential || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Expansion Potential"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="zoning.futureDevelopment.denseUsePotential"
                    checked={formik.values.zoning.futureDevelopment?.denseUsePotential || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Potential for More Dense Use"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="zoning.futureDevelopment.inOpportunityZone"
                    checked={formik.values.zoning.futureDevelopment?.inOpportunityZone || false}
                    onChange={formik.handleChange}
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
            name="zoning.zoningNotes"
            label="Additional Zoning Notes"
            multiline
            rows={3}
            value={formik.values.zoning.zoningNotes || ''}
            onChange={formik.handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Zoning;
