import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  FileCopy as DuplicateIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Field, FieldArray, useFormikContext } from 'formik';

// Import sub-components for different sections
import BasicInfoSection from './sections/BasicInfoSection';
import SpaceDetailsSection from './sections/SpaceDetailsSection';
import LeaseTermsSection from './sections/LeaseTermsSection';
import FinancialTermsSection from './sections/FinancialTermsSection';
import TIAllowanceSection from './sections/TIAllowanceSection';
import CAMExpensesSection from './sections/CAMExpensesSection';
import LeaseOptionsSection from './sections/LeaseOptionsSection';
import KeyDatesSection from './sections/KeyDatesSection';
import LegalTermsSection from './sections/LegalTermsSection';

const TenantLeaseForm = ({ tenant, prefix, onChange, onDuplicate }) => {
  const [activeSection, setActiveSection] = useState(0);
  const { values, touched, errors, setFieldValue, handleChange, handleBlur } = useFormikContext();
  
  const handleSectionChange = (event, newValue) => {
    setActiveSection(newValue);
  };

  const updateField = (field, value) => {
    // Update the specific field
    setFieldValue(`${prefix}.${field}`, value);
    
    // Notify parent component of the change
    const updatedFields = { [field]: value };
    onChange(updatedFields);
  };

  const sections = [
    { label: 'Basic Info', component: BasicInfoSection },
    { label: 'Space Details', component: SpaceDetailsSection },
    { label: 'Lease Terms', component: LeaseTermsSection },
    { label: 'Financial', component: FinancialTermsSection },
    { label: 'TI Allowance', component: TIAllowanceSection },
    { label: 'CAM & Expenses', component: CAMExpensesSection },
    { label: 'Options', component: LeaseOptionsSection },
    { label: 'Key Dates', component: KeyDatesSection },
    { label: 'Legal', component: LegalTermsSection },
  ];

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3">
          {tenant.tenantName || 'New Tenant Lease'}
        </Typography>
        
        <Box>
          <Tooltip title="Duplicate this tenant">
            <IconButton 
              onClick={onDuplicate}
              color="primary"
              sx={{ mr: 1 }}
            >
              <DuplicateIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            type="submit"
          >
            Save Lease
          </Button>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeSection}
          onChange={handleSectionChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {sections.map((section, index) => (
            <Tab key={index} label={section.label} />
          ))}
        </Tabs>
      </Box>
      
      {sections.map((section, index) => {
        const SectionComponent = section.component;
        return (
          <Box key={index} hidden={activeSection !== index} sx={{ pt: 3 }}>
            {activeSection === index && (
              <SectionComponent
                prefix={prefix}
                tenant={tenant}
                updateField={updateField}
              />
            )}
          </Box>
        );
      })}
    </Paper>
  );
};

export default TenantLeaseForm;
