import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import UploadStep from './steps/UploadStep';
import MappingStep from './steps/MappingStep';
import ReviewStep from './steps/ReviewStep';
import ConfirmationStep from './steps/ConfirmationStep';
import axios from 'axios';

const steps = ['Upload CSV', 'Map Fields', 'Review Data', 'Import'];

const CompsImporter = ({ propertyId, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [sourceColumns, setSourceColumns] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [targetFields, setTargetFields] = useState([]);
  const [fieldCategories, setFieldCategories] = useState({});
  const [fieldMappings, setFieldMappings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  // Load available target fields on component mount
  useEffect(() => {
    fetchTargetFields();
    fetchDefaultMappings();
  }, []);

  // Fetch available fields for mapping
  const fetchTargetFields = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/import/fields');
      setTargetFields(response.data.fields);
      setFieldCategories(response.data.categories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching target fields:', error);
      setError('Failed to load field options. Please try again.');
      setLoading(false);
    }
  };

  // Fetch default field mappings
  const fetchDefaultMappings = async () => {
    try {
      const response = await axios.get('/api/import/mappings/default');
      setFieldMappings(response.data);
    } catch (error) {
      console.error('Error fetching default mappings:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await axios.post('/api/import/comps/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadedFile(uploadResponse.data);
      
      // Get preview data
      const previewResponse = await axios.get(`/api/import/preview/${uploadResponse.data.filename}`);
      
      setSourceColumns(previewResponse.data.columns);
      setPreviewData(previewResponse.data.previewData);
      setFileData(previewResponse.data);
      
      // Auto-map fields based on column names
      autoMapFields(previewResponse.data.columns);
      
      setLoading(false);
      handleNext();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  // Auto-map fields based on similar column names
  const autoMapFields = (columns) => {
    const newMappings = { ...fieldMappings };
    
    // Clean target field names for comparison
    const targetFieldsLower = {};
    Object.keys(newMappings).forEach(targetField => {
      targetFieldsLower[targetField.toLowerCase().replace(/[_\s-]/g, '')] = targetField;
    });
    
    // Match source columns with targets
    columns.forEach(column => {
      const cleanColumn = column.toLowerCase().replace(/[_\s-]/g, '');
      
      // Check for exact match after cleaning
      if (targetFieldsLower[cleanColumn]) {
        newMappings[targetFieldsLower[cleanColumn]] = column;
        return;
      }
      
      // Check for partial matches
      Object.keys(targetFieldsLower).forEach(fieldKey => {
        if (cleanColumn.includes(fieldKey) || fieldKey.includes(cleanColumn)) {
          // Only set if not already mapped
          if (!newMappings[targetFieldsLower[fieldKey]]) {
            newMappings[targetFieldsLower[fieldKey]] = column;
          }
        }
      });
    });
    
    setFieldMappings(newMappings);
  };

  // Handle field mapping updates
  const handleMappingChange = (targetField, sourceField) => {
    setFieldMappings(prev => ({
      ...prev,
      [targetField]: sourceField
    }));
  };

  // Process import
  const processImport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const importData = {
        filename: uploadedFile.filename,
        propertyId,
        mappings: fieldMappings
      };
      
      const response = await axios.post('/api/import/comps/process', importData);
      
      setImportResult(response.data);
      setLoading(false);
      handleNext(); // Move to confirmation step
    } catch (error) {
      console.error('Error processing import:', error);
      setError('Failed to import data. ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  // Move to next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Move to previous step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle process completion
  const handleFinish = () => {
    if (onComplete) {
      onComplete(importResult);
    }
  };

  // Reset the import process
  const handleReset = () => {
    setActiveStep(0);
    setUploadedFile(null);
    setFileData(null);
    setSourceColumns([]);
    setPreviewData([]);
    setError(null);
    setImportResult(null);
    fetchDefaultMappings();
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Import Comparable Properties</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Upload a CSV file containing property data to import as comparables for your valuation.
          This tool supports mapping hundreds of fields from your CSV file to the property database.
        </Typography>
        
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Divider sx={{ mb: 3 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeStep === 0 && (
              <UploadStep onFileUpload={handleFileUpload} />
            )}
            
            {activeStep === 1 && (
              <MappingStep
                sourceColumns={sourceColumns}
                targetFields={targetFields}
                fieldCategories={fieldCategories}
                mappings={fieldMappings}
                onMappingChange={handleMappingChange}
                previewData={previewData}
              />
            )}
            
            {activeStep === 2 && (
              <ReviewStep
                previewData={previewData}
                mappings={fieldMappings}
                onContinue={processImport}
                propertyId={propertyId}
              />
            )}
            
            {activeStep === 3 && (
              <ConfirmationStep
                result={importResult}
                onFinish={handleFinish}
                onImportMore={handleReset}
              />
            )}
            
            {activeStep < steps.length - 1 && activeStep > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={loading}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button
                  onClick={handleNext}
                  disabled={loading || (activeStep === 1 && Object.values(fieldMappings).filter(Boolean).length === 0)}
                  variant="contained"
                >
                  {activeStep === steps.length - 2 ? 'Import' : 'Next'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CompsImporter;
