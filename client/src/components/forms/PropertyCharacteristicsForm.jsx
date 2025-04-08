import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Tab,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Container,
  Typography,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import IdentificationTab from './IdentificationTab';
import ZoningTab from './ZoningTab';
import PhysicalAttributesTab from './PhysicalAttributesTab';
import { PropertyFormValidationSchema } from './validationSchema';

const PropertyCharacteristicsForm = () => {
  const [activeTab, setActiveTab] = useState('1');

  // Initial form values
  const initialValues = {
    // Identification tab
    apn: '',
    lastSaleDate: null,
    latitude: 40.7128, // Default to NYC
    longitude: -74.0060,
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Zoning tab
    overlayZones: [],
    frontSetback: 0,
    rearSetback: 0,
    sideSetback: 0,
    parkingType: '',
    
    // Physical Attributes tab
    effectiveAge: 1,
    yearBuilt: new Date().getFullYear() - 10, // Default to 10 years ago
    floorPlateArea: 0,
    ceilingHeight: 0,
    // Building Systems
    hasHVAC: false,
    hasSprinkler: false,
    hasElevator: false,
    hasSecuritySystem: false,
    hasBMS: false,
    hasGenerators: false,
    hasEnergyManagement: false,
    hasSmartLighting: false
  };

  const [submitSuccess, setSubmitSuccess] = useState(false);

  // State for workflow navigation
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState('propertyCharacteristics');
  const navigate = useNavigate(); // React Router's navigation hook

  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    console.log('Form submitted with values:', values);
    // Here you would typically send the data to your backend API
    // axios.post('/api/properties', values);
    
    // Simulate a successful submission
    setTimeout(() => {
      setSubmitSuccess(true);
      setSubmitting(false);
      
      // Navigate to the next workflow step after a short delay
      setTimeout(() => {
        setCurrentWorkflowStep('comparableProperties');
        // Use React Router to navigate to the next page
        navigate('/comparable-properties-selection');
      }, 1500);
    }, 500);
  };

  // Initialize formik
  const formik = useFormik({
    initialValues,
    validationSchema: PropertyFormValidationSchema,
    onSubmit: handleSubmit,
    validateOnMount: true, // This will validate the form when it first renders
    enableReinitialize: true, // Re-initialize when initialValues change
    validateOnChange: true  // Validate fields on every change
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Helper function to check if all fields in a tab are valid
  const isTabValid = (tabFields) => {
    if (!formik.dirty) return true; // If form not touched yet, tab is valid
    
    return tabFields.every(field => {
      return !formik.touched[field] || !formik.errors[field];
    });
  };

  // Define fields for each tab
  const tabFields = {
    '1': ['apn', 'lastSaleDate', 'latitude', 'longitude', 'streetAddress', 'city', 'state', 'zipCode'],
    '2': ['overlayZones', 'frontSetback', 'rearSetback', 'sideSetback', 'parkingType'],
    '3': ['effectiveAge', 'yearBuilt', 'floorPlateArea', 'ceilingHeight', 'hasHVAC', 'hasSprinkler',
          'hasElevator', 'hasSecuritySystem', 'hasBMS', 'hasGenerators', 'hasEnergyManagement', 'hasSmartLighting']
  };

  return (
    <Container maxWidth="md">
      {submitSuccess && (
        <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="body1">
            Form submitted successfully! Property data has been saved.
          </Typography>
        </Paper>
      )}
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        <form onSubmit={(e) => {
            // Only allow the form to submit when explicitly using the submit button
            e.preventDefault();
          }}>
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList 
                onChange={handleTabChange} 
                aria-label="property characteristics tabs"
                variant="fullWidth"
              >
                <Tab 
                  label="Identification" 
                  value="1" 
                  icon={isTabValid(tabFields['1']) ? null : 
                    <Box component="span" sx={{ 
                      bgcolor: 'error.main', 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      ml: 1 
                    }} />} 
                />
                <Tab 
                  label="Zoning" 
                  value="2" 
                  icon={isTabValid(tabFields['2']) ? null : 
                    <Box component="span" sx={{ 
                      bgcolor: 'error.main', 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      ml: 1 
                    }} />} 
                />
                <Tab 
                  label="Physical Attributes" 
                  value="3" 
                  icon={isTabValid(tabFields['3']) ? null : 
                    <Box component="span" sx={{ 
                      bgcolor: 'error.main', 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      ml: 1 
                    }} />} 
                />
              </TabList>
            </Box>
            <TabPanel value="1">
              <IdentificationTab formik={formik} />
            </TabPanel>
            <TabPanel value="2">
              <ZoningTab formik={formik} />
            </TabPanel>
            <TabPanel value="3">
              <PhysicalAttributesTab formik={formik} />
            </TabPanel>
          </TabContext>

          {/* Navigation and Submit Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              type="button"
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                const currentTabIndex = parseInt(activeTab);
                if (currentTabIndex > 1) {
                  setActiveTab((currentTabIndex - 1).toString());
                }
              }}
              disabled={activeTab === '1'}
            >
              Previous
            </Button>

            {activeTab !== '3' ? (
              <Button
                variant="contained"
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // Prevent form submission
                  const currentTabIndex = parseInt(activeTab);
                  if (currentTabIndex < 3) {
                    setActiveTab((currentTabIndex + 1).toString());
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Manual form submission triggered');
                  formik.handleSubmit();
                }}
              >
                Submit
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      {/* Form Debug Information - Remove in production */}
      {process.env.NODE_ENV !== 'production' && (
        <Paper elevation={3} sx={{ p: 3, my: 3 }}>
          <Typography variant="h6">Form State (for debugging)</Typography>
          <Typography variant="body2">isValid: {formik.isValid.toString()}</Typography>
          <Typography variant="body2">isSubmitting: {formik.isSubmitting.toString()}</Typography>
          <Typography variant="body2">dirty: {formik.dirty.toString()}</Typography>
          <Typography variant="body2">Errors: {Object.keys(formik.errors).length > 0 ? Object.keys(formik.errors).join(', ') : 'None'}</Typography>
          <pre>{JSON.stringify(formik.values, null, 2)}</pre>
          <Typography variant="h6">Form Errors</Typography>
          <pre>{JSON.stringify(formik.errors, null, 2)}</pre>
        </Paper>
      )}
    </Container>
  );
};

export default PropertyCharacteristicsForm;
