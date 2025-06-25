import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Slider,
  FormControlLabel,
  Switch,
  Box,
  InputAdornment,
} from '@mui/material';

const PhysicalAttributes = ({ formik }) => {
  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Physical Attributes
      </Typography>
      <Grid container spacing={3}>
        {/* Numerical input for Effective Age */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="effectiveAge"
            name="physicalAttributes.effectiveAge"
            label="Effective Age"
            type="number"
            value={formik.values.physicalAttributes.effectiveAge || 1}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.physicalAttributes?.effectiveAge && Boolean(formik.errors.physicalAttributes?.effectiveAge)}
            helperText={formik.touched.physicalAttributes?.effectiveAge && formik.errors.physicalAttributes?.effectiveAge}
            InputProps={{
              endAdornment: <InputAdornment position="end">years</InputAdornment>,
              inputProps: { min: 1, max: 100, step: 1 }
            }}
          />
        </Grid>
        
        {/* Year Built Field */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="yearBuilt"
            name="physicalAttributes.yearBuilt"
            label="Year Built"
            type="number"
            value={formik.values.physicalAttributes.yearBuilt || new Date().getFullYear() - 10}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.physicalAttributes?.yearBuilt && Boolean(formik.errors.physicalAttributes?.yearBuilt)}
            helperText={formik.touched.physicalAttributes?.yearBuilt && formik.errors.physicalAttributes?.yearBuilt}
            InputProps={{
              inputProps: { min: 1800, max: new Date().getFullYear(), step: 1 }
            }}
          />
        </Grid>

        {/* Measurement inputs for Floor Plate/Ceiling Height */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="floorPlateArea"
            name="physicalAttributes.floorPlateArea"
            label="Floor Plate Area"
            type="number"
            value={formik.values.physicalAttributes.floorPlateArea}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.physicalAttributes?.floorPlateArea && Boolean(formik.errors.physicalAttributes?.floorPlateArea)}
            helperText={formik.touched.physicalAttributes?.floorPlateArea && formik.errors.physicalAttributes?.floorPlateArea}
            InputProps={{
              endAdornment: <InputAdornment position="end">sq ft</InputAdornment>,
              inputProps: { min: 0 }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="ceilingHeight"
            name="physicalAttributes.ceilingHeight"
            label="Ceiling Height"
            type="number"
            value={formik.values.physicalAttributes.ceilingHeight}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.physicalAttributes?.ceilingHeight && Boolean(formik.errors.physicalAttributes?.ceilingHeight)}
            helperText={formik.touched.physicalAttributes?.ceilingHeight && formik.errors.physicalAttributes?.ceilingHeight}
            InputProps={{
              endAdornment: <InputAdornment position="end">ft</InputAdornment>,
              inputProps: { min: 0, step: 0.1 }
            }}
          />
        </Grid>

        {/* Building Systems section with additional options */}
        <Grid item xs={12}>
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Building Systems
            </Typography>
            <Grid container spacing={2}>
              {/* First column of systems */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.physicalAttributes.hasHVAC || false}
                      onChange={formik.handleChange}
                      name="physicalAttributes.hasHVAC"
                      color="primary"
                    />
                  }
                  label="HVAC System"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.physicalAttributes.hasSprinkler || false}
                      onChange={formik.handleChange}
                      name="physicalAttributes.hasSprinkler"
                      color="primary"
                    />
                  }
                  label="Fire Sprinkler System"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.physicalAttributes.hasElevator || false}
                      onChange={formik.handleChange}
                      name="physicalAttributes.hasElevator"
                      color="primary"
                    />
                  }
                  label="Elevator"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.physicalAttributes.hasSecuritySystem || false}
                      onChange={formik.handleChange}
                      name="physicalAttributes.hasSecuritySystem"
                      color="primary"
                    />
                  }
                  label="Security System"
                />
              </Grid>
              
              {/* Second column of systems */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.physicalAttributes.hasBMS || false}
                      onChange={formik.handleChange}
                      name="physicalAttributes.hasBMS"
                      color="primary"
                    />
                  }
                  label="Building Management System (BMS)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.physicalAttributes.hasGenerators || false}
                      onChange={formik.handleChange}
                      name="physicalAttributes.hasGenerators"
                      color="primary"
                    />
                  }
                  label="Emergency Generators"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.physicalAttributes.hasEnergyManagement || false}
                      onChange={formik.handleChange}
                      name="physicalAttributes.hasEnergyManagement"
                      color="primary"
                    />
                  }
                  label="Energy Management Systems"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.physicalAttributes.hasSmartLighting || false}
                      onChange={formik.handleChange}
                      name="physicalAttributes.hasSmartLighting"
                      color="primary"
                    />
                  }
                  label="Smart Lighting Controls"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        
        {/* Additional Physical Attributes Fields could be added here */}
        {/* For example: Year Built, Square Footage, Number of Stories, etc. */}
      </Grid>
    </Paper>
  );
};

export default PhysicalAttributes;
