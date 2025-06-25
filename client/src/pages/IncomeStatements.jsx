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

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const IncomeStatements = ({ formik }) => {

  const addRentRollEntry = () => {
    const rentRoll = [...(formik.values.income.rentRoll || [])];
    rentRoll.push({
      unit: '',
      tenant: '',
      leaseStart: '',
      leaseEnd: '',
      monthlyRent: '',
      annualRent: '',
      rentPSF: ''
    });
    formik.setFieldValue('income.rentRoll', rentRoll);
  };

  const removeRentRollEntry = (index) => {
    const rentRoll = [...(formik.values.income.rentRoll || [])];
    rentRoll.splice(index, 1);
    formik.setFieldValue('income.rentRoll', rentRoll);
  };

  const handleRentRollChange = (index, field, value) => {
    const rentRoll = [...(formik.values.income.rentRoll || [])];
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
      } else {
        rentRoll[index].rentPSF = '';
      }
    }
    
    formik.setFieldValue('income.rentRoll', rentRoll);
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
              name="income.incomePeriod"
              value={formik.values.income.incomePeriod || ''}
              onChange={formik.handleChange}
              label="Income Period"
              error={formik.touched.income?.incomePeriod && Boolean(formik.errors.income?.incomePeriod)}
              helperText={formik.touched.income?.incomePeriod && formik.errors.income?.incomePeriod}
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
            name="income.asOfDate"
            label="As of Date"
            type="date"
            value={formik.values.income.asOfDate || ''}
            onChange={formik.handleChange}
            InputLabelProps={{ shrink: true }}
            error={formik.touched.income?.asOfDate && Boolean(formik.errors.income?.asOfDate)}
            helperText={formik.touched.income?.asOfDate && formik.errors.income?.asOfDate}
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
            name="income.baseRent"
            label="Base Rental Income"
            type="number"
            value={formik.values.income.baseRent || ''}
            onChange={formik.handleChange}
            InputProps={{ startAdornment: '$' }}
            error={formik.touched.income?.baseRent && Boolean(formik.errors.income?.baseRent)}
            helperText={formik.touched.income?.baseRent && formik.errors.income?.baseRent}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="expenseReimbursements"
            name="income.expenseReimbursements"
            label="Expense Reimbursements"
            type="number"
            value={formik.values.income.expenseReimbursements || ''}
            onChange={formik.handleChange}
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="percentageRent"
            name="income.percentageRent"
            label="Percentage Rent"
            type="number"
            value={formik.values.income.percentageRent || ''}
            onChange={formik.handleChange}
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="otherIncome"
            name="income.otherIncome"
            label="Other Income"
            type="number"
            value={formik.values.income.otherIncome || ''}
            onChange={formik.handleChange}
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
            value={Number(
              (parseFloat(formik.values.income.baseRent || 0) +
              parseFloat(formik.values.income.expenseReimbursements || 0) +
              parseFloat(formik.values.income.percentageRent || 0) +
              parseFloat(formik.values.income.otherIncome || 0)).toFixed(2)
            )}
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
                {(formik.values.income.rentRoll || []).map((entry, index) => {
                  const getError = (field) => 
                    formik.touched.income?.rentRoll?.[index]?.[field] && 
                    formik.errors.income?.rentRoll?.[index]?.[field];

                  return (
                    <TableRow key={index}>
                    <TableCell>
                      <TextField
                          fullWidth
                          size="small"
                          value={entry.unit || ''}
                          onChange={(e) => handleRentRollChange(index, 'unit', e.target.value)}
                          error={!!getError('unit')}
                          helperText={getError('unit')}
                        />
                    </TableCell>
                    <TableCell>
                      <TextField
                          fullWidth
                          size="small"
                          value={entry.tenant || ''}
                          onChange={(e) => handleRentRollChange(index, 'tenant', e.target.value)}
                          error={!!getError('tenant')}
                          helperText={getError('tenant')}
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
                          error={!!getError('monthlyRent')}
                          helperText={getError('monthlyRent')}
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
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {(formik.values.income.rentRoll || []).length === 0 && (
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
            name="income.incomeNotes"
            label="Additional Income Notes"
            multiline
            rows={3}
            value={formik.values.income.incomeNotes || ''}
            onChange={formik.handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IncomeStatements;
