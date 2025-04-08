import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Info as InfoIcon,
} from '@mui/icons-material';
import { useFormikContext } from 'formik';

const SpaceDetailsSection = ({ prefix, tenant, updateField }) => {
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Space Details
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          required
          id={`${prefix}.leasedArea`}
          name={`${prefix}.leasedArea`}
          label="Leased Area"
          type="number"
          value={tenant.leasedArea}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('leasedArea', value);
          }}
          onBlur={handleBlur}
          error={touched.leasedArea && Boolean(errors.leasedArea)}
          helperText={touched.leasedArea && errors.leasedArea}
          InputProps={{
            endAdornment: <InputAdornment position="end">SF</InputAdornment>
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.percentageOfBuilding`}
          name={`${prefix}.percentageOfBuilding`}
          label="Percentage of Building"
          type="number"
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
            readOnly: true
          }}
          value={tenant.percentageOfBuilding}
          sx={{ bgcolor: 'action.hover' }}
          helperText="Automatically calculated"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.floorNumber`}
          name={`${prefix}.floorNumber`}
          label="Floor Number"
          value={tenant.floorNumber}
          onChange={(e) => {
            handleChange(e);
            updateField('floorNumber', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.usableArea`}
          name={`${prefix}.usableArea`}
          label="Usable Area"
          type="number"
          value={tenant.usableArea}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('usableArea', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            endAdornment: <InputAdornment position="end">SF</InputAdornment>
          }}
          helperText="Usable area before applying load factor"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.loadFactor`}
          name={`${prefix}.loadFactor`}
          label="Load Factor"
          type="number"
          value={tenant.loadFactor}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 1;
            handleChange(e);
            updateField('loadFactor', value);
            
            // Recalculate leasedArea if usableArea is set
            if (tenant.usableArea > 0) {
              const newLeasedArea = tenant.usableArea * value;
              updateField('leasedArea', newLeasedArea);
            }
          }}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: (
              <Tooltip title="Ratio of rentable area to usable area. Typical range: 1.1-1.2 for office, 1.0-1.05 for retail">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.commonAreaShare`}
          name={`${prefix}.commonAreaShare`}
          label="Common Area Share"
          type="number"
          value={tenant.commonAreaShare || 0}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleChange(e);
            updateField('commonAreaShare', value);
          }}
          onBlur={handleBlur}
          InputProps={{
            endAdornment: <InputAdornment position="end">SF</InputAdornment>
          }}
          helperText="Tenant's share of common areas"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id={`${prefix}.suiteDimensions`}
          name={`${prefix}.suiteDimensions`}
          label="Suite Dimensions"
          value={tenant.suiteDimensions || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('suiteDimensions', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="e.g., 50' x 75' or approximate dimensions"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id={`${prefix}.suiteConfiguration`}
          name={`${prefix}.suiteConfiguration`}
          label="Suite Configuration"
          value={tenant.suiteConfiguration || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('suiteConfiguration', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="e.g., Open Plan, Multiple Offices, etc."
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          id={`${prefix}.spaceComments`}
          name={`${prefix}.spaceComments`}
          label="Space Comments"
          value={tenant.spaceComments || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('spaceComments', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="Additional information about space layout, features, or condition"
        />
      </Grid>
    </Grid>
  );
};

export default SpaceDetailsSection;
