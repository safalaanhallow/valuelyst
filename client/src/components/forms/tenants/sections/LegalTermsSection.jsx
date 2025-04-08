import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { useFormikContext } from 'formik';

const attorneyReviewStatuses = [
  'Not Reviewed',
  'Reviewing',
  'Approved',
  'Rejected',
  'Changes Required',
  'N/A'
];

const subleaseRights = [
  'Full Rights',
  'With Landlord Approval',
  'Limited Rights',
  'No Rights',
  'Not Specified'
];

const LegalTermsSection = ({ prefix, tenant, updateField }) => {
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Legal Terms
        </Typography>
      </Grid>
      
      {/* Attorney Review */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Legal Review
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth>
          <InputLabel id={`${prefix}.attorneyReviewStatus-label`}>Attorney Review Status</InputLabel>
          <Select
            labelId={`${prefix}.attorneyReviewStatus-label`}
            id={`${prefix}.attorneyReviewStatus`}
            name={`${prefix}.attorneyReviewStatus`}
            value={tenant.attorneyReviewStatus || ''}
            label="Attorney Review Status"
            onChange={(e) => {
              handleChange(e);
              updateField('attorneyReviewStatus', e.target.value);
            }}
          >
            {attorneyReviewStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.attorneyName`}
          name={`${prefix}.attorneyName`}
          label="Attorney Name"
          value={tenant.attorneyName || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('attorneyName', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.attorneyContact`}
          name={`${prefix}.attorneyContact`}
          label="Attorney Contact"
          value={tenant.attorneyContact || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('attorneyContact', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      {/* Sublease and Assignment */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Sublease & Assignment
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6} md={6}>
        <FormControl fullWidth>
          <InputLabel id={`${prefix}.subleaseRights-label`}>Sublease Rights</InputLabel>
          <Select
            labelId={`${prefix}.subleaseRights-label`}
            id={`${prefix}.subleaseRights`}
            name={`${prefix}.subleaseRights`}
            value={tenant.subleaseRights || ''}
            label="Sublease Rights"
            onChange={(e) => {
              handleChange(e);
              updateField('subleaseRights', e.target.value);
            }}
          >
            {subleaseRights.map((rights) => (
              <MenuItem key={rights} value={rights}>
                {rights}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6} md={6}>
        <TextField
          fullWidth
          id={`${prefix}.assignmentConditions`}
          name={`${prefix}.assignmentConditions`}
          label="Assignment Conditions"
          value={tenant.assignmentConditions || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('assignmentConditions', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      {/* Guarantor Information */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Guarantor Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={tenant.hasGuarantor || false}
              onChange={(e) => {
                const checked = e.target.checked;
                handleChange(e);
                updateField('hasGuarantor', checked);
              }}
              name={`${prefix}.hasGuarantor`}
            />
          }
          label="Has Guarantor"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.guarantorName`}
          name={`${prefix}.guarantorName`}
          label="Guarantor Name"
          value={tenant.guarantorName || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('guarantorName', e.target.value);
          }}
          onBlur={handleBlur}
          disabled={!tenant.hasGuarantor}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.guarantorRelationship`}
          name={`${prefix}.guarantorRelationship`}
          label="Guarantor Relationship"
          value={tenant.guarantorRelationship || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('guarantorRelationship', e.target.value);
          }}
          onBlur={handleBlur}
          disabled={!tenant.hasGuarantor}
        />
      </Grid>
      
      {/* Amendments & Special Provisions */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Amendments & Special Provisions
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.amendmentCount`}
          name={`${prefix}.amendmentCount`}
          label="Number of Amendments"
          type="number"
          value={tenant.amendmentCount || 0}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            handleChange(e);
            updateField('amendmentCount', value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={8}>
        <TextField
          fullWidth
          id={`${prefix}.amendmentSummary`}
          name={`${prefix}.amendmentSummary`}
          label="Amendment Summary"
          value={tenant.amendmentSummary || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('amendmentSummary', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          id={`${prefix}.specialProvisions`}
          name={`${prefix}.specialProvisions`}
          label="Special Provisions"
          value={tenant.specialProvisions || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('specialProvisions', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="Any special clauses, provisions, or unique terms of the lease"
        />
      </Grid>
      
      {/* Documentation */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Documentation
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id={`${prefix}.documentLocation`}
          name={`${prefix}.documentLocation`}
          label="Document Location"
          value={tenant.documentLocation || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('documentLocation', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="Physical or digital location of lease documents"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id={`${prefix}.documentReference`}
          name={`${prefix}.documentReference`}
          label="Document Reference"
          value={tenant.documentReference || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('documentReference', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="File numbers, document IDs, or other references"
        />
      </Grid>
      
      {/* Additional Legal Notes */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          id={`${prefix}.legalNotes`}
          name={`${prefix}.legalNotes`}
          label="Legal Notes"
          value={tenant.legalNotes || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('legalNotes', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="Any additional legal notes, issues, or concerns"
        />
      </Grid>
    </Grid>
  );
};

export default LegalTermsSection;
