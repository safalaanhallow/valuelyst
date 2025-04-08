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

const PhysicalAttributesTab = ({ formik }) => {
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
            name="effectiveAge"
            label="Effective Age"
            type="number"
            value={formik.values.effectiveAge || 1}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.effectiveAge && Boolean(formik.errors.effectiveAge)}
            helperText={formik.touched.effectiveAge && formik.errors.effectiveAge}
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
            name="yearBuilt"
            label="Year Built"
            type="number"
            value={formik.values.yearBuilt || new Date().getFullYear() - 10}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.yearBuilt && Boolean(formik.errors.yearBuilt)}
            helperText={formik.touched.yearBuilt && formik.errors.yearBuilt}
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
            name="floorPlateArea"
            label="Floor Plate Area"
            type="number"
            value={formik.values.floorPlateArea}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.floorPlateArea && Boolean(formik.errors.floorPlateArea)}
            helperText={formik.touched.floorPlateArea && formik.errors.floorPlateArea}
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
            name="ceilingHeight"
            label="Ceiling Height"
            type="number"
            value={formik.values.ceilingHeight}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.ceilingHeight && Boolean(formik.errors.ceilingHeight)}
            helperText={formik.touched.ceilingHeight && formik.errors.ceilingHeight}
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
                      checked={formik.values.hasHVAC || false}
                      onChange={formik.handleChange}
                      name="hasHVAC"
                      color="primary"
                    />
                  }
                  label="HVAC System"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.hasSprinkler || false}
                      onChange={formik.handleChange}
                      name="hasSprinkler"
                      color="primary"
                    />
                  }
                  label="Fire Sprinkler System"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.hasElevator || false}
                      onChange={formik.handleChange}
                      name="hasElevator"
                      color="primary"
                    />
                  }
                  label="Elevator"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.hasSecuritySystem || false}
                      onChange={formik.handleChange}
                      name="hasSecuritySystem"
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
                      checked={formik.values.hasBMS || false}
                      onChange={formik.handleChange}
                      name="hasBMS"
                      color="primary"
                    />
                  }
                  label="Building Management System (BMS)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.hasGenerators || false}
                      onChange={formik.handleChange}
                      name="hasGenerators"
                      color="primary"
                    />
                  }
                  label="Emergency Generators"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.hasEnergyManagement || false}
                      onChange={formik.handleChange}
                      name="hasEnergyManagement"
                      color="primary"
                    />
                  }
                  label="Energy Management Systems"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.hasSmartLighting || false}
                      onChange={formik.handleChange}
                      name="hasSmartLighting"
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

export default PhysicalAttributesTab;
