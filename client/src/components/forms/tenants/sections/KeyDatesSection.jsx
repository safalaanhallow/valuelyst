import React from 'react';
import {
  Grid,
  Typography,
  TextField,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormikContext } from 'formik';

const KeyDatesSection = ({ prefix, tenant, updateField }) => {
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Key Lease Dates
          </Typography>
        </Grid>
        
        {/* Commencement Dates */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Commencement Dates
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Lease Commencement Date"
            value={tenant.leaseCommencementDate}
            onChange={(newValue) => {
              updateField('leaseCommencementDate', newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                id={`${prefix}.leaseCommencementDate`}
                name={`${prefix}.leaseCommencementDate`}
                error={touched.leaseCommencementDate && Boolean(errors.leaseCommencementDate)}
                helperText={touched.leaseCommencementDate && errors.leaseCommencementDate}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Rent Commencement Date"
            value={tenant.rentCommencementDate}
            onChange={(newValue) => {
              updateField('rentCommencementDate', newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                id={`${prefix}.rentCommencementDate`}
                name={`${prefix}.rentCommencementDate`}
                error={touched.rentCommencementDate && Boolean(errors.rentCommencementDate)}
                helperText={touched.rentCommencementDate && errors.rentCommencementDate}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Occupancy Date"
            value={tenant.occupancyDate}
            onChange={(newValue) => {
              updateField('occupancyDate', newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                id={`${prefix}.occupancyDate`}
                name={`${prefix}.occupancyDate`}
                error={touched.occupancyDate && Boolean(errors.occupancyDate)}
                helperText={touched.occupancyDate && errors.occupancyDate}
              />
            )}
          />
        </Grid>
        
        {/* Expiration & Notice Dates */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Expiration & Notice Dates
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Expiration Date"
            value={tenant.expirationDate}
            onChange={(newValue) => {
              updateField('expirationDate', newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                id={`${prefix}.expirationDate`}
                name={`${prefix}.expirationDate`}
                error={touched.expirationDate && Boolean(errors.expirationDate)}
                helperText={touched.expirationDate && errors.expirationDate}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Renewal Notice Date"
            value={tenant.renewalNoticeDate}
            onChange={(newValue) => {
              updateField('renewalNoticeDate', newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                id={`${prefix}.renewalNoticeDate`}
                name={`${prefix}.renewalNoticeDate`}
                error={touched.renewalNoticeDate && Boolean(errors.renewalNoticeDate)}
                helperText={touched.renewalNoticeDate && errors.renewalNoticeDate}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Estoppel Date"
            value={tenant.estoppelDate}
            onChange={(newValue) => {
              updateField('estoppelDate', newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                id={`${prefix}.estoppelDate`}
                name={`${prefix}.estoppelDate`}
                error={touched.estoppelDate && Boolean(errors.estoppelDate)}
                helperText={touched.estoppelDate && errors.estoppelDate}
              />
            )}
          />
        </Grid>
        
        {/* Other Key Dates */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Other Key Dates
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Rent Escalation Date"
            value={tenant.nextRentEscalationDate}
            onChange={(newValue) => {
              updateField('nextRentEscalationDate', newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                id={`${prefix}.nextRentEscalationDate`}
                name={`${prefix}.nextRentEscalationDate`}
                error={touched.nextRentEscalationDate && Boolean(errors.nextRentEscalationDate)}
                helperText={touched.nextRentEscalationDate && errors.nextRentEscalationDate}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="CAM Reconciliation Date"
            value={tenant.camReconciliationDate}
            onChange={(newValue) => {
              updateField('camReconciliationDate', newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                id={`${prefix}.camReconciliationDate`}
                name={`${prefix}.camReconciliationDate`}
                error={touched.camReconciliationDate && Boolean(errors.camReconciliationDate)}
                helperText={touched.camReconciliationDate && errors.camReconciliationDate}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            label="Last Amendment Date"
            value={tenant.lastAmendmentDate}
            onChange={(newValue) => {
              updateField('lastAmendmentDate', newValue);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                id={`${prefix}.lastAmendmentDate`}
                name={`${prefix}.lastAmendmentDate`}
                error={touched.lastAmendmentDate && Boolean(errors.lastAmendmentDate)}
                helperText={touched.lastAmendmentDate && errors.lastAmendmentDate}
              />
            )}
          />
        </Grid>
        
        {/* Additional Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            id={`${prefix}.keyDatesNotes`}
            name={`${prefix}.keyDatesNotes`}
            label="Key Dates Notes"
            value={tenant.keyDatesNotes || ''}
            onChange={(e) => {
              handleChange(e);
              updateField('keyDatesNotes', e.target.value);
            }}
            onBlur={handleBlur}
            helperText="Additional notes about important dates or deadlines"
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default KeyDatesSection;
