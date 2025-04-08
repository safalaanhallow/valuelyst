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
  InputLabel
} from '@mui/material';

const EnvironmentalCharacteristics = ({ formik }) => {
  // Ensure values is initialized
  const values = formik.values || {};
  
  // Helper function to create the fully qualified field name with prefix
  const fieldName = (name) => `environmental.${name}`;

  // Helper to handle onChange for this component
  const handleChange = (e) => {
    formik.handleChange(e);
  };
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Environmental Characteristics
      </Typography>
      <Typography variant="body2" paragraph>
        Collect environmental data about the property including flood zones, soil conditions, and environmental compliance.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="flood-zone-label">Flood Zone</InputLabel>
            <Select
              labelId="flood-zone-label"
              id="floodZone"
              name={fieldName('floodZone')}
              value={values.floodZone || ''}
              onChange={handleChange}
              error={formik.touched.floodZone && Boolean(formik.errors.floodZone)}
              label="Flood Zone"
            >
              <MenuItem value="">Select Flood Zone</MenuItem>
              <MenuItem value="X">Zone X (Minimal Risk)</MenuItem>
              <MenuItem value="A">Zone A</MenuItem>
              <MenuItem value="AE">Zone AE</MenuItem>
              <MenuItem value="AH">Zone AH</MenuItem>
              <MenuItem value="AO">Zone AO</MenuItem>
              <MenuItem value="V">Zone V (Coastal)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="soilType"
            name={fieldName('soilType')}
            label="Soil Type"
            value={values.soilType || ''}
            onChange={handleChange}
            error={formik.touched.soilType && Boolean(formik.errors.soilType)}
            helperText={formik.touched.soilType && formik.errors.soilType}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Environmental Factors</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('environmentalFactors.wetlands')}
                    checked={values.environmentalFactors?.wetlands || false}
                    onChange={handleChange}
                  />
                }
                label="Protected Wetlands"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('environmentalFactors.endangeredSpecies')}
                    checked={values.environmentalFactors?.endangeredSpecies || false}
                    onChange={handleChange}
                  />
                }
                label="Endangered Species Habitat"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name={fieldName('environmentalFactors.contaminationHistory')}
                    checked={values.environmentalFactors?.contaminationHistory || false}
                    onChange={handleChange}
                  />
                }
                label="History of Contamination"
              />
            </FormGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="environmental-assessment-label">Environmental Assessment</InputLabel>
            <Select
              labelId="environmental-assessment-label"
              id="environmentalAssessment"
              name={fieldName('environmentalAssessment')}
              value={values.environmentalAssessment || ''}
              onChange={handleChange}
              error={formik.touched.environmentalAssessment && Boolean(formik.errors.environmentalAssessment)}
              label="Environmental Assessment"
            >
              <MenuItem value="">Select Assessment Level</MenuItem>
              <MenuItem value="phase1">Phase I Completed</MenuItem>
              <MenuItem value="phase2">Phase II Completed</MenuItem>
              <MenuItem value="remediation">Remediation Completed</MenuItem>
              <MenuItem value="none">Not Assessed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="assessmentDate"
            name={fieldName('assessmentDate')}
            label="Assessment Date"
            type="date"
            value={values.assessmentDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={formik.touched.assessmentDate && Boolean(formik.errors.assessmentDate)}
            helperText={formik.touched.assessmentDate && formik.errors.assessmentDate}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="environmentalNotes"
            name={fieldName('environmentalNotes')}
            label="Environmental Notes"
            multiline
            rows={4}
            value={values.environmentalNotes || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EnvironmentalCharacteristics;
