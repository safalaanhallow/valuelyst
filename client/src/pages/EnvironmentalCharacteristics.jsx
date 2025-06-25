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
              name="environmental.floodZone"
              value={formik.values.environmental.floodZone || ''}
              onChange={formik.handleChange}
              error={formik.touched.environmental?.floodZone && Boolean(formik.errors.environmental?.floodZone)}
              helperText={formik.touched.environmental?.floodZone && formik.errors.environmental?.floodZone}
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
            name="environmental.soilType"
            label="Soil Type"
            value={formik.values.environmental.soilType || ''}
            onChange={formik.handleChange}
            error={formik.touched.environmental?.soilType && Boolean(formik.errors.environmental?.soilType)}
            helperText={formik.touched.environmental?.soilType && formik.errors.environmental?.soilType}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Environmental Factors</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    name="environmental.environmentalFactors.wetlands"
                    checked={formik.values.environmental.environmentalFactors?.wetlands || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Protected Wetlands"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="environmental.environmentalFactors.endangeredSpecies"
                    checked={formik.values.environmental.environmentalFactors?.endangeredSpecies || false}
                    onChange={formik.handleChange}
                  />
                }
                label="Endangered Species Habitat"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    name="environmental.environmentalFactors.contaminationHistory"
                    checked={formik.values.environmental.environmentalFactors?.contaminationHistory || false}
                    onChange={formik.handleChange}
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
              name="environmental.environmentalAssessment"
              value={formik.values.environmental.environmentalAssessment || ''}
              onChange={formik.handleChange}
              error={formik.touched.environmental?.environmentalAssessment && Boolean(formik.errors.environmental?.environmentalAssessment)}
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
            name="environmental.assessmentDate"
            label="Assessment Date"
            type="date"
            value={formik.values.environmental.assessmentDate || ''}
            onChange={formik.handleChange}
            InputLabelProps={{ shrink: true }}
            error={formik.touched.environmental?.assessmentDate && Boolean(formik.errors.environmental?.assessmentDate)}
            helperText={formik.touched.environmental?.assessmentDate && formik.errors.environmental?.assessmentDate}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="environmentalNotes"
            name="environmental.environmentalNotes"
            label="Environmental Notes"
            multiline
            rows={4}
            value={formik.values.environmental.environmentalNotes || ''}
            onChange={formik.handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EnvironmentalCharacteristics;
