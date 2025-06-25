import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppraisal } from '../context/AppraisalContext';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  LinearProgress
} from '@mui/material';

// This component manages the overall workflow navigation and progress
const WorkflowNavigator = ({ children, currentStep, formik }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSubjectProperty, subjectProperty } = useAppraisal();
  
  // Define all steps in the workflow
  const workflowSteps = [
    // Property Characteristics (5 substeps)
    { id: 'identification', label: 'Identification', path: '/', group: 'Property Characteristics' },
    { id: 'zoning', label: 'Zoning', path: '/zoning', group: 'Property Characteristics' },
    { id: 'physical-attributes', label: 'Physical Attributes', path: '/physical-attributes', group: 'Property Characteristics' },
    { id: 'environmental', label: 'Environmental', path: '/environmental', group: 'Property Characteristics' },
    { id: 'accessibility', label: 'Accessibility & Location', path: '/accessibility', group: 'Property Characteristics' },
    
    // Financial Information (5 substeps)
    { id: 'income-statements', label: 'Income Statements', path: '/income-statements', group: 'Financial Information' },
    { id: 'vacancy-adjustments', label: 'Vacancy Adjustments', path: '/vacancy-adjustments', group: 'Financial Information' },
    { id: 'operating-expenses', label: 'Operating Expenses', path: '/operating-expenses', group: 'Financial Information' },
    { id: 'debt-structures', label: 'Debt Structures', path: '/debt-structures', group: 'Financial Information' },
    { id: 'valuation-metrics', label: 'Valuation Metrics', path: '/valuation-metrics', group: 'Financial Information' },
    
    // Tenant Details (1 step)
    { id: 'tenant-details', label: 'Tenant Details & Lease Terms', path: '/tenant-details', group: 'Tenant Information' },
    
    // Comparable Selection and Valuation (3 steps)
    { id: 'comparable-selection', label: 'Comparable Selection', path: '/comparable-properties-selection', group: 'Valuation' },
    { id: 'adjustments', label: 'Adjustments', path: '/adjustments', group: 'Valuation' },
    { id: 'valuation-results', label: 'Valuation Results', path: '/valuation-results', group: 'Valuation' },
  ];

  // Find the current step based on the currentStep prop or URL path
  const getCurrentStepIndex = () => {
    // If currentStep prop is provided, use it to find the step index
    if (currentStep) {
      const index = workflowSteps.findIndex(step => step.id === currentStep);
      if (index >= 0) return index;
    }
    
    // Otherwise fall back to using the URL path
    const currentPath = location.pathname;
    const index = workflowSteps.findIndex(step => step.path === currentPath);
    return index >= 0 ? index : 0; // Default to first step if not found
  };

  const [activeStep, setActiveStep] = useState(getCurrentStepIndex());
  // Track which steps have been completed
  const [completedSteps, setCompletedSteps] = useState({});
  
  // Load completed steps from localStorage on initial render
  useEffect(() => {
    const savedCompletedSteps = localStorage.getItem('valuelytstCompletedSteps');
    if (savedCompletedSteps) {
      try {
        setCompletedSteps(JSON.parse(savedCompletedSteps));
      } catch (e) {
        console.error('Failed to parse completed steps from localStorage');
      }
    }
  }, []);

  // Safety sync: Ensure subject property data is available when entering Valuation steps
  useEffect(() => {
    const currentStepIndex = getCurrentStepIndex();
    const currentStepData = workflowSteps[currentStepIndex];
    
    // If we're in a Valuation step and don't have subject property data
    if (currentStepData && currentStepData.group === 'Valuation') {
      // Check if subject property is missing or incomplete
      const hasValidSubjectProperty = subjectProperty && 
        subjectProperty.identification && 
        subjectProperty.identification.streetAddress;
      
      // If missing and formik has data, sync it
      if (!hasValidSubjectProperty && formik && formik.values && 
          formik.values.identification && formik.values.identification.streetAddress) {
        console.log('WorkflowNavigator: Auto-syncing subject property for Valuation step');
        setSubjectProperty(formik.values);
      }
    }
  }, [location.pathname, subjectProperty, formik, setSubjectProperty]);

  // Update active step when path changes
  useEffect(() => {
    setActiveStep(getCurrentStepIndex());
  }, [location.pathname]);
  
  // Save completed steps to localStorage when they change
  useEffect(() => {
    localStorage.setItem('valuelytstCompletedSteps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  // Group steps by their category
  const groupedSteps = workflowSteps.reduce((acc, step) => {
    if (!acc[step.group]) {
      acc[step.group] = [];
    }
    acc[step.group].push(step);
    return acc;
  }, {});

  // Navigation functions
  const handleNext = () => {
    const currentStepIndex = activeStep;
    const nextStepIndex = activeStep + 1;

    if (nextStepIndex < workflowSteps.length) {
      const currentGroup = workflowSteps[currentStepIndex].group;
      const nextGroup = workflowSteps[nextStepIndex].group;

      // When moving from data entry to valuation, set the subject property.
      if (currentGroup !== 'Valuation' && nextGroup === 'Valuation') {
        if (formik && formik.values) {
          setSubjectProperty(formik.values);
        }
      }

      // Mark current step as completed
      const currentStepId = workflowSteps[currentStepIndex].id;
      setCompletedSteps(prev => ({
        ...prev,
        [currentStepId]: true,
      }));

      // Navigate to the next step
      navigate(workflowSteps[nextStepIndex].path);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1;
      navigate(workflowSteps[prevStep].path);
    }
  };

  const navigateToStep = (index) => {
    if (index >= 0 && index < workflowSteps.length) {
      navigate(workflowSteps[index].path);
    }
  };

  // Calculate overall progress
  const progress = ((activeStep + 1) / workflowSteps.length) * 100;

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        {/* Progress indicator */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 1 }}>
            Step {activeStep + 1} of {workflowSteps.length}
          </Typography>
        </Box>

        {/* Main workflow content */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Side navigation */}
          <Box sx={{ width: { xs: '100%', md: '250px' }, mr: { md: 4 }, mb: { xs: 3, md: 0 } }}>
            {Object.entries(groupedSteps).map(([groupName, steps]) => (
              <Box key={groupName} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {groupName}
                </Typography>
                <Stepper orientation="vertical" activeStep={activeStep} nonLinear>
                  {steps.map((step, index) => {
                    const stepIndex = workflowSteps.findIndex(s => s.id === step.id);
                    return (
                      <Step key={step.id} completed={completedSteps[step.id] === true}>
                        <StepLabel 
                          onClick={() => navigateToStep(stepIndex)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {step.label}
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </Box>
            ))}
          </Box>

          {/* Main content area */}
          <Box sx={{ flexGrow: 1 }}>
            {children}

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
              <Button 
                variant="outlined" 
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              
              {activeStep < workflowSteps.length - 1 ? (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                >
                  {activeStep === workflowSteps.length - 2 ? 'Finish' : 'Continue'}
                </Button>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default WorkflowNavigator;
