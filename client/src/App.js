import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Box, AppBar, Toolbar } from '@mui/material';
import axios from 'axios';
import ComparablePropertiesSelection from './pages/ComparablePropertiesSelection';
import ValuationResults from './pages/ValuationResults';
import WorkflowNavigator from './pages/WorkflowNavigator';
import Zoning from './pages/Zoning';
import EnvironmentalCharacteristics from './pages/EnvironmentalCharacteristics';
import Identification from './pages/Identification';
import PhysicalAttributes from './pages/PhysicalAttributes';
import AccessibilityLocation from './pages/AccessibilityLocation';
import IncomeStatements from './pages/IncomeStatements';
import VacancyAdjustments from './pages/VacancyAdjustments';
import OperatingExpenses from './pages/OperatingExpenses';
import DebtStructures from './pages/DebtStructures';
import ValuationMetrics from './pages/ValuationMetrics';
import TenantDetails from './pages/TenantDetails';
import AdjustmentsPage from './pages/AdjustmentsPage';
import { AppraisalProvider } from './context/AppraisalContext';

// Configure axios default base URL
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

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
  const validationSchema = Yup.object({
    identification: Yup.object({
      propertyType: Yup.string().required('Property type is required'),
      apn: Yup.string().required('APN is required'),
      lastSaleDate: Yup.date().nullable().required('Last sale date is required'),
      streetAddress: Yup.string().required('Street address is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      zipCode: Yup.string().required('Zip code is required'),
    }),
    physicalAttributes: Yup.object({
      effectiveAge: Yup.number().positive('Must be positive').required('Effective age is required'),
      yearBuilt: Yup.number().min(1800, 'Invalid year').max(new Date().getFullYear(), 'Invalid year').required('Year built is required'),
      floorPlateArea: Yup.number().positive('Must be positive').required('Floor plate area is required'),
      ceilingHeight: Yup.number().positive('Must be positive').required('Ceiling height is required'),
    }),
    zoning: Yup.object({
      zoningCode: Yup.string().required('Zoning code is required'),
      landArea: Yup.number().positive('Must be positive').required('Land area is required'),
    }),
    environmental: Yup.object({
      floodZone: Yup.string().required('Flood zone is required'),
      soilType: Yup.string().required('Soil type is required'),
    }),
    accessibility: Yup.object({
        walkScore: Yup.number().min(0).max(100, 'Score must be 100 or less').required('Walk Score is required'),
        transitScore: Yup.number().min(0).max(100, 'Score must be 100 or less').required('Transit Score is required'),
    }),
    income: Yup.object({
      incomePeriod: Yup.string().required('Income period is required'),
      asOfDate: Yup.date().required('As of date is required').nullable(),
      baseRent: Yup.number().min(0, 'Cannot be negative').required('Base rent is required'),
      rentRoll: Yup.array().of(
        Yup.object().shape({
          unit: Yup.string().required('Unit name is required'),
          tenant: Yup.string().required('Tenant name is required'),
          monthlyRent: Yup.number().min(0).required('Monthly rent is required'),
        })
      ),
    }),
    vacancy: Yup.object({
      vacancyRate: Yup.number().min(0).max(100).required('Vacancy rate is required'),
      creditLossRate: Yup.number().min(0).max(100).required('Credit loss rate is required'),
    }),
    expenses: Yup.object({
      expenseYear: Yup.number().required('Expense year is required'),
      operatingExpenses: Yup.object(),
    }),
    valuation: Yup.object({
      estimatedValue: Yup.number().required('Estimated value is required'),
      valuationDate: Yup.date().required('Valuation date is required'),
      capRate: Yup.number().min(0).max(100).required('Cap rate is required'),
    }),
  });

  const formik = useFormik({
    initialValues: {
    // Initial values for all form sections
    // Property characteristics
        identification: {
      latitude: 39.8283,
      longitude: -98.5795,
      propertyType: '',
      propertySubType: '',
      apn: '',
      lastSaleDate: null,
      streetAddress: '',
      city: '',
      state: '',
      zipCode: ''
    },
    zoning: {
      setbacks: {},
      parkingRequirements: {},
      zoningStatus: {},
      futureDevelopment: {}
    },
    physicalAttributes: {
      effectiveAge: 1,
      yearBuilt: 2013,
      floorPlateArea: 0,
      ceilingHeight: 0,
      hasHVAC: false,
      hasSprinkler: false,
      hasElevator: false,
      hasSecuritySystem: false,
      hasBMS: false,
      hasGenerators: false,
      hasEnergyManagement: false,
      hasSmartLighting: false
    },
    environmental: {
      floodZone: '',
      soilType: '',
      environmentalFactors: {
        wetlands: false,
        endangeredSpecies: false,
        contaminationHistory: false,
      },
      environmentalAssessment: '',
      assessmentDate: null,
      environmentalNotes: '',
    },
    accessibility: {
      walkScore: '',
      transitScore: '',
      distanceToHighway: '',
      distanceToAirport: '',
      accessibilityFeatures: {
        adaCompliant: false,
        wheelchairRamps: false,
        accessibleParking: false,
        accessibleRestrooms: false,
      },
      retailProximity: 0,
      restaurantProximity: 0,
      entertainmentProximity: 0,
      nearbyAmenities: '',
      locationNotes: '',
      medianIncomeZip: '',
      populationDensity: '',
      employmentRate: '',
    },
    income: {
      incomePeriod: '',
      asOfDate: null,
      baseRent: '',
      expenseReimbursements: '',
      percentageRent: '',
      otherIncome: '',
      incomeNotes: '',
      rentRoll: [],
    },
    vacancy: {
      marketVacancyRate: '',
      submarketVacancyRate: '',
      vacancyRate: 5,
      vacancyLossAmount: '',
      creditLossRate: 2,
      creditLossAmount: '',
      freeRentMonths: '',
      tenantImprovementAllowance: '',
      concessionsNotes: '',
    },
    expenses: {
      buildingSize: '',
      expenseYear: new Date().getFullYear(),
      operatingExpenses: {
        taxes: '',
        insurance: '',
        utilities: '',
        maintenance: '',
        management: '',
        administrative: '',
        landscaping: '',
        security: '',
        cleaning: '',
        reserves: '',
        other: '',
      },
      netOperatingIncome: '',
    },
    valuation: {
      estimatedValue: '',
      valuationDate: new Date().toISOString().split('T')[0],
      capRate: '',
      valuePerSquareFoot: '',
      grossRentMultiplier: '',
      discountRate: '',
      terminalCapRate: '',
      holdingPeriod: '',
      annualIncomeGrowth: '',
      marketMetrics: {
        pricePSF: { low: '', average: '', high: '' },
        capRate: { low: '', average: '', high: '' },
        grm: { low: '', average: '', high: '' },
      },
      valuationMethods: {
        incomeApproach: '',
        salesComparison: '',
        costApproach: '',
      },
      valuationNotes: '',
    },
    historicalExpenses: [],
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
  },
  validationSchema,
  onSubmit: (values) => {
    console.log('Form submitted', values);
  },
});
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
            <AppraisalProvider>
              <Routes>
              {/* Property Characteristics Section */}
                            <Route path="/" element={
                <WorkflowNavigator formik={formik} currentStep="identification">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Property Identification
                  </Typography>
                                    <Identification formik={formik} />
                </WorkflowNavigator>
              } />
              <Route path="/zoning" element={
                <WorkflowNavigator formik={formik} currentStep="zoning">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Zoning Information
                  </Typography>
                                    <Zoning formik={formik} />
                </WorkflowNavigator>
              } />
                            <Route path="/physical-attributes" element={
                <WorkflowNavigator formik={formik} currentStep="physical">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Physical Attributes
                  </Typography>
                                    <PhysicalAttributes formik={formik} />
                </WorkflowNavigator>
              } />
              <Route path="/environmental" element={
                <WorkflowNavigator formik={formik} currentStep="environmental">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Environmental Characteristics
                  </Typography>
                                    <EnvironmentalCharacteristics formik={formik} />
                </WorkflowNavigator>
              } />
              <Route path="/accessibility" element={
                <WorkflowNavigator formik={formik} currentStep="accessibility">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Accessibility & Location
                  </Typography>
                                    <AccessibilityLocation formik={formik} />
                </WorkflowNavigator>
              } />

              {/* Financial Information Section */}
              <Route path="/income-statements" element={
                <WorkflowNavigator formik={formik} currentStep="income">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Income Statements & Rent Roll
                  </Typography>
                                    <IncomeStatements formik={formik} />
                </WorkflowNavigator>
              } />
              <Route path="/vacancy-adjustments" element={
                <WorkflowNavigator formik={formik} currentStep="vacancy">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Vacancy & Credit Loss Adjustments
                  </Typography>
                                    <VacancyAdjustments formik={formik} />
                </WorkflowNavigator>
              } />
              <Route path="/operating-expenses" element={
                <WorkflowNavigator formik={formik} currentStep="expenses">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Operating Expenses
                  </Typography>
                                    <OperatingExpenses formik={formik} />
                </WorkflowNavigator>
              } />
              <Route path="/debt-structures" element={
                <WorkflowNavigator formik={formik} currentStep="debt">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Debt Structures
                  </Typography>
                                    <DebtStructures formik={formik} />
                </WorkflowNavigator>
              } />
              <Route path="/valuation-metrics" element={
                <WorkflowNavigator formik={formik} currentStep="metrics">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Valuation Metrics
                  </Typography>
                                    <ValuationMetrics formik={formik} />
                </WorkflowNavigator>
              } />

              {/* Tenant Information Section */}
              <Route path="/tenant-details" element={
                <WorkflowNavigator formik={formik} currentStep="tenants">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Tenant Details & Lease Terms
                  </Typography>
                                    <TenantDetails formik={formik} />
                </WorkflowNavigator>
              } />

              {/* Valuation Analysis Section */}
              <Route path="/comparable-properties-selection" element={
                <WorkflowNavigator formik={formik} currentStep="comps">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Comparable Properties Selection
                  </Typography>
                  <ComparablePropertiesSelection />
                </WorkflowNavigator>
              } />
              <Route path="/adjustments" element={
                <WorkflowNavigator formik={formik} currentStep="adjustments">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Comparable Properties & Adjustments
                  </Typography>
                                    <AdjustmentsPage formik={formik} />
                </WorkflowNavigator>
              } />
              <Route path="/valuation-results" element={
                <WorkflowNavigator formik={formik} currentStep="results">
                  <Typography variant="h4" component="h1" gutterBottom align="center">
                    Valuation Results
                  </Typography>
                  <ValuationResults />
                </WorkflowNavigator>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppraisalProvider>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
