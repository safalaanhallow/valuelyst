import React, { useState } from 'react';
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
  Divider,
} from '@mui/material';
import CompsSelector from './CompsSelector';
import AppraisalReport from './AppraisalReport';
import axios from 'axios';

const steps = ['Select Comparables', 'Review & Generate', 'Appraisal Report'];

const Appraisal = ({ propertyId, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedComps, setSelectedComps] = useState(null);
  const [appraisal, setAppraisal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompsSelected = (compsData) => {
    setSelectedComps(compsData);
    setActiveStep(1);
  };

  const handleGenerateAppraisal = async () => {
    if (!selectedComps) {
      setError('No comparables selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/properties/appraisal/generate', {
        propertyId: propertyId,
        selectedCompIds: selectedComps.selectedCompIds,
        adjustments: selectedComps.adjustments
      });

      setAppraisal(response.data.appraisal);
      setActiveStep(2);
      setLoading(false);
    } catch (error) {
      console.error('Error generating appraisal:', error);
      setError(error.response?.data?.message || 'Failed to generate appraisal');
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a downloadable version of the report
    const reportContent = document.createElement('div');
    reportContent.innerHTML = document.querySelector('[data-report-content]').innerHTML;
    
    const blob = new Blob([reportContent.outerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Appraisal_Report_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    if (activeStep === 1) {
      setError(null);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedComps(null);
    setAppraisal(null);
    setError(null);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <CompsSelector
            propertyId={propertyId}
            onCompsSelected={handleCompsSelected}
          />
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Selected Comparables
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Review your selected comparable properties and adjustments before generating the appraisal report.
            </Typography>
            
            {selectedComps && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Properties: {selectedComps.selectedCompIds.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Property IDs: {selectedComps.selectedCompIds.join(', ')}
                </Typography>
                
                {Object.keys(selectedComps.adjustments).length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Adjustments Applied:
                    </Typography>
                    {Object.entries(selectedComps.adjustments).map(([propId, adjustments]) => (
                      <Box key={propId} sx={{ ml: 2, mb: 1 }}>
                        <Typography variant="body2">
                          Property {propId}: {Object.entries(adjustments).filter(([key, value]) => value).length} adjustments
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleGenerateAppraisal}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Appraisal Report'}
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box data-report-content>
            <AppraisalReport
              appraisal={appraisal}
              onPrint={handlePrint}
              onDownload={handleDownload}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleReset}>
                Start New Appraisal
              </Button>
              <Button
                variant="contained"
                onClick={() => onComplete && onComplete(appraisal)}
              >
                Complete
              </Button>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Commercial Property Appraisal
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Generate a comprehensive commercial property appraisal using comparable sales analysis and income approach methodology.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {getStepContent(activeStep)}
      </Paper>
    </Box>
  );
};

export default Appraisal;
