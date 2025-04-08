import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Box, AppBar, Toolbar } from '@mui/material';
import PropertyCharacteristicsForm from './components/forms/PropertyCharacteristicsForm';
import ComparablePropertiesSelection from './pages/ComparablePropertiesSelection';
import ValuationResults from './pages/ValuationResults';
import WorkflowNavigator from './pages/WorkflowNavigator';
import Zoning from './pages/Zoning';
import EnvironmentalCharacteristics from './pages/EnvironmentalCharacteristics';
import AccessibilityLocation from './pages/AccessibilityLocation';
import IncomeStatements from './pages/IncomeStatements';
import VacancyAdjustments from './pages/VacancyAdjustments';
import OperatingExpenses from './pages/OperatingExpenses';
import DebtStructures from './pages/DebtStructures';
import ValuationMetrics from './pages/ValuationMetrics';
import TenantDetails from './pages/TenantDetails';
import AdjustmentsPage from './pages/AdjustmentsPage';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  // Create form state to manage property values across all steps
  const [formValues, setFormValues] = React.useState({
    // Initial values for all form sections
    // Property characteristics
    identification: {},
    zoning: {
      setbacks: {},
      parkingRequirements: {},
      zoningStatus: {},
      futureDevelopment: {}
    },
    physicalAttributes: {},
    environmental: {
      environmentalFeatures: {},
      environmentalRisks: {},
      sustainableFeatures: {}
    },
    accessibility: {
      accessibility: {},
      transportation: {},
      proximityFeatures: {}
    },
    
    // Financial information
    income: {
      income: {},
      rentRolls: [],
      historicalData: []
    },
    vacancy: {
      vacancy: {},
      creditLoss: {},
      adjustments: []
    },
    expenses: {
      expenses: {
        taxes: {},
        insurance: {},
        utilities: {},
        maintenance: {},
        management: {},
        other: {}
      },
      historicalExpenses: []
    },
    debt: {
      debt: {
        loans: [],
        financing: {}
      }
    },
    valuations: {
      valuations: {
        capRate: {},
        noi: {},
        cashFlow: {},
        irr: {},
        multipliers: {}
      }
    },
    
    // Tenant information
    tenants: {
      tenants: [],
      leaseNotes: ''
    },
    
    // Valuation analysis
    comps: [],
    adjustments: {}
  });
  
  // Create a generic handleChange function for all form components
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // Handle nested fields with dot notation (e.g., 'zoning.setbacks.front')
    const namePath = name.split('.');
    if (namePath.length === 1) {
      // Simple field
      setFormValues({ ...formValues, [name]: fieldValue });
    } else {
      // Nested field
      const [section, ...rest] = namePath;
      const fieldPath = rest.join('.');
      
      setFormValues({
        ...formValues,
        [section]: {
          ...formValues[section],
          // Use the setNestedValue helper for deeply nested properties
          ...setNestedValue(formValues[section] || {}, fieldPath, fieldValue)
        }
      });
    }
  };
  
  // Helper function to set value in a nested object given a dot-notation path
  const setNestedValue = (obj, path, value) => {
    const parts = path.split('.');
    const lastPart = parts.pop();
    let current = { ...obj };
    let currentObj = current;
    
    // Build up the nested structure
    for (const part of parts) {
      currentObj[part] = { ...currentObj[part] };
      currentObj = currentObj[part];
    }
    
    // Set the final value
    currentObj[lastPart] = value;
    return current;
  };
  
  // Create a generic setFieldValue function for formik components
  const setFieldValue = (field, value) => {
    // Handle nested fields with dot notation
    const fieldPath = field.split('.');
    if (fieldPath.length === 1) {
      // Simple field
      setFormValues({ ...formValues, [field]: value });
    } else {
      // Nested field
      const [section, ...rest] = fieldPath;
      const restPath = rest.join('.');
      
      setFormValues({
        ...formValues,
        [section]: {
          ...formValues[section],
          ...setNestedValue(formValues[section] || {}, restPath, value)
        }
      });
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ValueLyst - Property Analytics Platform
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Routes>
              {/* Property Characteristics Section */}
              <Route path="/" element={
                <WorkflowNavigator currentStep="identification">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Property Identification
                  </Typography>
                  <PropertyCharacteristicsForm activeTab={0} formik={{
                    values: formValues.identification,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />
              <Route path="/zoning" element={
                <WorkflowNavigator currentStep="zoning">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Zoning Information
                  </Typography>
                  <Zoning formik={{
                    values: formValues.zoning,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {}, 
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />
              <Route path="/physical-attributes" element={
                <WorkflowNavigator currentStep="physical">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Physical Attributes
                  </Typography>
                  <PropertyCharacteristicsForm activeTab={1} formik={{
                    values: formValues.physicalAttributes,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />
              <Route path="/environmental" element={
                <WorkflowNavigator currentStep="environmental">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Environmental Characteristics
                  </Typography>
                  <EnvironmentalCharacteristics formik={{
                    values: formValues.environmental,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />
              <Route path="/accessibility" element={
                <WorkflowNavigator currentStep="accessibility">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Accessibility & Location
                  </Typography>
                  <AccessibilityLocation formik={{
                    values: formValues.accessibility,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />

              {/* Financial Information Section */}
              <Route path="/income-statements" element={
                <WorkflowNavigator currentStep="income">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Income Statements & Rent Roll
                  </Typography>
                  <IncomeStatements formik={{
                    values: formValues.income,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />
              <Route path="/vacancy-adjustments" element={
                <WorkflowNavigator currentStep="vacancy">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Vacancy & Credit Loss Adjustments
                  </Typography>
                  <VacancyAdjustments formik={{
                    values: formValues.vacancy,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />
              <Route path="/operating-expenses" element={
                <WorkflowNavigator currentStep="expenses">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Operating Expenses
                  </Typography>
                  <OperatingExpenses formik={{
                    values: formValues.expenses,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />
              <Route path="/debt-structures" element={
                <WorkflowNavigator currentStep="debt">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Debt Structures
                  </Typography>
                  <DebtStructures formik={{
                    values: formValues.debt,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />
              <Route path="/valuation-metrics" element={
                <WorkflowNavigator currentStep="metrics">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Valuation Metrics
                  </Typography>
                  <ValuationMetrics formik={{
                    values: formValues.valuations,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />

              {/* Tenant Information Section */}
              <Route path="/tenant-details" element={
                <WorkflowNavigator currentStep="tenants">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Tenant Details & Lease Terms
                  </Typography>
                  <TenantDetails formik={{
                    values: formValues.tenants,
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />

              {/* Valuation Analysis Section */}
              <Route path="/comparable-properties-selection" element={
                <WorkflowNavigator currentStep="comps">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Comparable Properties Selection
                  </Typography>
                  <ComparablePropertiesSelection />
                </WorkflowNavigator>
              } />
              <Route path="/adjustments" element={
                <WorkflowNavigator currentStep="adjustments">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Comparable Properties & Adjustments
                  </Typography>
                  <AdjustmentsPage formik={{
                    values: {
                      comps: formValues.comps,
                      adjustments: formValues.adjustments
                    },
                    handleChange: handleChange,
                    setFieldValue: setFieldValue,
                    touched: {},
                    errors: {}
                  }} />
                </WorkflowNavigator>
              } />
              <Route path="/valuation-results" element={
                <WorkflowNavigator currentStep="results">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Valuation Results
                  </Typography>
                  <ValuationResults />
                </WorkflowNavigator>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
