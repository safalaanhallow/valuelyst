import React from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useFormikContext } from 'formik';

const tenantTypes = [
  'Commercial',
  'Retail',
  'Industrial',
  'Office',
  'Medical',
  'Restaurant',
  'Warehouse',
  'Mixed Use',
  'Other'
];

const leaseStatuses = [
  'Active',
  'Pending',
  'Expired',
  'In Negotiation',
  'Terminated',
  'In Default',
  'Month-to-Month',
  'Holdover',
  'Renewed'
];

const creditRatings = [
  'AAA',
  'AA',
  'A',
  'BBB',
  'BB',
  'B',
  'CCC',
  'CC',
  'C',
  'D',
  'Not Rated'
];

const BasicInfoSection = ({ prefix, tenant, updateField }) => {
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Basic Tenant Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          required
          id={`${prefix}.tenantName`}
          name={`${prefix}.tenantName`}
          label="Tenant Name"
          value={tenant.tenantName}
          onChange={(e) => {
            handleChange(e);
            updateField('tenantName', e.target.value);
          }}
          onBlur={handleBlur}
          error={touched.tenantName && Boolean(errors.tenantName)}
          helperText={touched.tenantName && errors.tenantName}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth>
          <InputLabel id={`${prefix}.tenantType-label`}>Tenant Type</InputLabel>
          <Select
            labelId={`${prefix}.tenantType-label`}
            id={`${prefix}.tenantType`}
            name={`${prefix}.tenantType`}
            value={tenant.tenantType}
            label="Tenant Type"
            onChange={(e) => {
              handleChange(e);
              updateField('tenantType', e.target.value);
            }}
          >
            {tenantTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.suiteNumber`}
          name={`${prefix}.suiteNumber`}
          label="Suite Number"
          value={tenant.suiteNumber}
          onChange={(e) => {
            handleChange(e);
            updateField('suiteNumber', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.contactName`}
          name={`${prefix}.contactName`}
          label="Primary Contact Name"
          value={tenant.contactName}
          onChange={(e) => {
            handleChange(e);
            updateField('contactName', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.contactEmail`}
          name={`${prefix}.contactEmail`}
          label="Contact Email"
          type="email"
          value={tenant.contactEmail}
          onChange={(e) => {
            handleChange(e);
            updateField('contactEmail', e.target.value);
          }}
          onBlur={handleBlur}
          error={touched.contactEmail && Boolean(errors.contactEmail)}
          helperText={touched.contactEmail && errors.contactEmail}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          id={`${prefix}.contactPhone`}
          name={`${prefix}.contactPhone`}
          label="Contact Phone"
          value={tenant.contactPhone}
          onChange={(e) => {
            handleChange(e);
            updateField('contactPhone', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={6}>
        <FormControl fullWidth>
          <InputLabel id={`${prefix}.leaseStatus-label`}>Lease Status</InputLabel>
          <Select
            labelId={`${prefix}.leaseStatus-label`}
            id={`${prefix}.leaseStatus`}
            name={`${prefix}.leaseStatus`}
            value={tenant.leaseStatus}
            label="Lease Status"
            onChange={(e) => {
              handleChange(e);
              updateField('leaseStatus', e.target.value);
            }}
          >
            {leaseStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6} md={6}>
        <FormControl fullWidth>
          <InputLabel id={`${prefix}.creditRating-label`}>Credit Rating</InputLabel>
          <Select
            labelId={`${prefix}.creditRating-label`}
            id={`${prefix}.creditRating`}
            name={`${prefix}.creditRating`}
            value={tenant.creditRating}
            label="Credit Rating"
            onChange={(e) => {
              handleChange(e);
              updateField('creditRating', e.target.value);
            }}
          >
            {creditRatings.map((rating) => (
              <MenuItem key={rating} value={rating}>
                {rating}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          id={`${prefix}.businessDescription`}
          name={`${prefix}.businessDescription`}
          label="Business Description"
          value={tenant.businessDescription}
          onChange={(e) => {
            handleChange(e);
            updateField('businessDescription', e.target.value);
          }}
          onBlur={handleBlur}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          id={`${prefix}.additionalContacts`}
          name={`${prefix}.additionalContacts`}
          label="Additional Contacts (Optional)"
          value={tenant.additionalContacts || ''}
          onChange={(e) => {
            handleChange(e);
            updateField('additionalContacts', e.target.value);
          }}
          onBlur={handleBlur}
          helperText="Include secondary contacts with name, role, email, and phone"
        />
      </Grid>
    </Grid>
  );
};

export default BasicInfoSection;
