import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import { createFieldNameHelper, createChangeHandler } from '../utils/formHelpers';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const IncomeStatements = ({ formik }) => {
  // Create helper functions for this component
  const fieldName = createFieldNameHelper('income');
  const handleChange = createChangeHandler(formik);
  
  // Ensure values is initialized
  const values = formik.values || {};
  const addRentRollEntry = () => {
    const rentRoll = [...(formik.values.rentRoll || [])];
    rentRoll.push({
      unit: '',
      tenant: '',
      leaseStart: '',
      leaseEnd: '',
      monthlyRent: '',
      annualRent: '',
      rentPSF: ''
    });
    formik.setFieldValue('rentRoll', rentRoll);
  };

  const removeRentRollEntry = (index) => {
    const rentRoll = [...(formik.values.rentRoll || [])];
    rentRoll.splice(index, 1);
    formik.setFieldValue('rentRoll', rentRoll);
  };

  const handleRentRollChange = (index, field, value) => {
    const rentRoll = [...(formik.values.rentRoll || [])];
    rentRoll[index][field] = value;
    
    // Calculate annual rent if monthly rent is provided
    if (field === 'monthlyRent') {
      const monthlyRent = parseFloat(value) || 0;
      rentRoll[index].annualRent = (monthlyRent * 12).toString();
    }
    
    // Calculate PSF if annual rent and square footage are available
    if (field === 'monthlyRent' || field === 'squareFeet') {
      const annualRent = parseFloat(rentRoll[index].annualRent) || 0;
      const squareFeet = parseFloat(rentRoll[index].squareFeet) || 0;
      if (squareFeet > 0) {
        rentRoll[index].rentPSF = (annualRent / squareFeet).toFixed(2);
      }
    }
    
    formik.setFieldValue('rentRoll', rentRoll);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Income Statements & Rent Roll Data
      </Typography>
      <Typography variant="body2" paragraph>
        Enter income statement data and rent roll information for the property.
      </Typography>

      <Grid container spacing={3}>
        {/* Income Period Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="income-period-label">Income Period</InputLabel>
            <Select
              labelId="income-period-label"
              id="incomePeriod"
              name={fieldName('incomePeriod')}
              value={values.incomePeriod  || ''}
              onChange={handleChange}
              label="Income Period"
            >
              <MenuItem value="ttm">Trailing Twelve Months</MenuItem>
              <MenuItem value="annualized">Annualized Current Month</MenuItem>
              <MenuItem value="proforma">Pro Forma</MenuItem>
              <MenuItem value="lastFiscalYear">Last Fiscal Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="asOfDate"
            name={fieldName('asOfDate')}
            label="As of Date"
            type="date"
            value={values.asOfDate  || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Gross Income */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Gross Income
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="baseRent"
            name={fieldName('baseRent')}
            label="Base Rental Income"
            type="number"
            value={values.baseRent  || ''}
            onChange={handleChange}
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="expenseReimbursements"
            name={fieldName('expenseReimbursements')}
            label="Expense Reimbursements"
            type="number"
            value={values.expenseReimbursements  || ''}
            onChange={handleChange}
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="percentageRent"
            name={fieldName('percentageRent')}
            label="Percentage Rent"
            type="number"
            value={values.percentageRent  || ''}
            onChange={handleChange}
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="otherIncome"
            name={fieldName('otherIncome')}
            label="Other Income"
            type="number"
            value={values.otherIncome  || ''}
            onChange={handleChange}
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            disabled
            id="potentialGrossIncome"
            label="Potential Gross Income"
            type="number"
            value={
              (parseFloat(formik.values.baseRent || 0) +
              parseFloat(formik.values.expenseReimbursements || 0) +
              parseFloat(formik.values.percentageRent || 0) +
              parseFloat(formik.values.otherIncome || 0)).toFixed(2)
            }
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>

        {/* Rent Roll */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Rent Roll
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={addRentRollEntry}
            >
              Add Unit
            </Button>
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Unit</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Sq. Ft.</TableCell>
                  <TableCell>Lease Start</TableCell>
                  <TableCell>Lease End</TableCell>
                  <TableCell>Monthly Rent</TableCell>
                  <TableCell>Annual Rent</TableCell>
                  <TableCell>Rent PSF</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(formik.values.rentRoll || []).map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={entry.unit || ''}
                        onChange={(e) => handleRentRollChange(index, 'unit', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={entry.tenant || ''}
                        onChange={(e) => handleRentRollChange(index, 'tenant', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={entry.squareFeet || ''}
                        onChange={(e) => handleRentRollChange(index, 'squareFeet', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={entry.leaseStart || ''}
                        onChange={(e) => handleRentRollChange(index, 'leaseStart', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={entry.leaseEnd || ''}
                        onChange={(e) => handleRentRollChange(index, 'leaseEnd', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={entry.monthlyRent || ''}
                        onChange={(e) => handleRentRollChange(index, 'monthlyRent', e.target.value)}
                        InputProps={{ startAdornment: '$' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        disabled
                        value={entry.annualRent || ''}
                        InputProps={{ startAdornment: '$' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        disabled
                        value={entry.rentPSF || ''}
                        InputProps={{ startAdornment: '$' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeRentRollEntry(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {(formik.values.rentRoll || []).length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 2 }}>
              No rent roll entries. Click "Add Unit" to add tenants.
            </Typography>
          )}
        </Grid>

        {/* Additional Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="incomeNotes"
            name={fieldName('incomeNotes')}
            label="Additional Income Notes"
            multiline
            rows={3}
            value={values.incomeNotes  || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IncomeStatements;
