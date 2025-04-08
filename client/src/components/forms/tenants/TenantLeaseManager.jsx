import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Timeline as TimelineIcon,
  CalculateOutlined as CalculateIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';

import TenantLeaseForm from './TenantLeaseForm';
import LeaseTimeline from './features/LeaseTimeline';
import TIAllowanceCalculator from './features/TIAllowanceCalculator';
import CAMChargeAllocator from './features/CAMChargeAllocator';

// Validation schema for a single tenant
const tenantValidationSchema = Yup.object({
  tenantName: Yup.string().required('Tenant name is required'),
  leaseStartDate: Yup.date().required('Lease start date is required'),
  leaseEndDate: Yup.date()
    .required('Lease end date is required')
    .min(
      Yup.ref('leaseStartDate'),
      'End date must be after start date'
    ),
  rentPSF: Yup.number().positive('Rent must be positive').required('Rent is required'),
  // Additional validations will be added for other fields
});

const initialTenant = {
  // Basic Information
  tenantName: '',
  tenantType: 'Commercial', // Commercial, Retail, Industrial, etc.
  suiteNumber: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  businessDescription: '',
  creditRating: '',
  leaseStatus: 'Active', // Active, Expired, In Negotiation, etc.
  
  // Space Details
  leasedArea: 0, // Square feet
  percentageOfBuilding: 0,
  floorNumber: '',
  usableArea: 0,
  loadFactor: 1.15, // Default load factor
  
  // Lease Terms
  leaseStartDate: new Date(),
  leaseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)), // Default 5-year lease
  originalLeaseTerm: 60, // Months
  remainingTerm: 60, // Months, calculated field
  leaseType: 'Full Service', // Full Service, Triple Net, Modified Gross, etc.
  
  // Financial Terms
  rentPSF: 0, // Annual rent per square foot
  rentMonthly: 0, // Calculated field: (rentPSF * leasedArea) / 12
  rentAnnual: 0, // Calculated field: rentPSF * leasedArea
  rentEscalation: 3, // Annual percentage increase
  rentEscalationFrequency: 12, // Months between escalations
  securityDeposit: 0,
  
  // TI Allowance
  tiAllowancePSF: 0,
  tiAllowanceTotal: 0, // Calculated field: tiAllowancePSF * leasedArea
  tiAllowanceRemaining: 0, // Calculated field: tiAllowanceTotal - tiAllowanceSpent
  tiAllowanceSpent: 0,
  
  // CAM and Operating Expenses
  baseYear: new Date().getFullYear(),
  isResponsibleForCAM: true,
  camRecoveryType: 'Pro Rata', // Pro Rata, Fixed Amount, etc.
  camSharePercentage: 0, // Calculated field: leasedArea / totalBuiltArea
  monthlyCAMFeePSF: 0,
  annualCAMCharges: 0, // Calculated field
  isResponsibleForUtilities: true,
  isResponsibleForRETaxes: true,
  isResponsibleForInsurance: true,
  stops: [], // Any expense stops
  
  // Options
  renewalOptions: [],
  terminationOptions: [],
  expansionOptions: [],
  rightOfFirstRefusal: false,
  rightOfFirstOffer: false,
  
  // Key Dates
  rentCommencementDate: new Date(),
  expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
  renewalNoticeDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4)), // Default 1 year before expiration
  
  // Legal
  attorneyReviewed: false,
  sublease: false,
  assignment: false,
  guarantor: '',
  amendments: [],
  specialProvisions: '',
  
  // Misc
  notes: '',
  documents: [], // Array of document references
  leaseHistory: [], // Array of previous lease terms or amendments
};

const calculateDerivedValues = (tenant) => {
  const startDate = new Date(tenant.leaseStartDate);
  const endDate = new Date(tenant.leaseEndDate);
  
  // Calculate remaining term in months
  const today = new Date();
  const remainingMonths = (endDate.getFullYear() - today.getFullYear()) * 12 + 
                          (endDate.getMonth() - today.getMonth());
  
  // Calculate financial values
  const rentAnnual = tenant.rentPSF * tenant.leasedArea;
  const rentMonthly = rentAnnual / 12;
  
  // Calculate TI allowance
  const tiAllowanceTotal = tenant.tiAllowancePSF * tenant.leasedArea;
  const tiAllowanceRemaining = tiAllowanceTotal - tenant.tiAllowanceSpent;
  
  // Calculate CAM charges
  const annualCAMCharges = tenant.monthlyCAMFeePSF * 12 * tenant.leasedArea;
  
  return {
    ...tenant,
    remainingTerm: Math.max(0, remainingMonths),
    rentAnnual,
    rentMonthly,
    tiAllowanceTotal,
    tiAllowanceRemaining,
    annualCAMCharges,
  };
};

const TenantLeaseManager = () => {
  const [tenants, setTenants] = useState([initialTenant]);
  const [activeTab, setActiveTab] = useState(0);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showTICalculator, setShowTICalculator] = useState(false);
  const [showCAMAllocator, setShowCAMAllocator] = useState(false);
  const [buildingArea, setBuildingArea] = useState(10000); // Default building area
  const [selectedTenantIndex, setSelectedTenantIndex] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 0 }}>
            Tenant Lease Manager
          </Typography>
          
          <Box>
            <Tooltip title="View Lease Timeline">
              <IconButton 
                color="primary" 
                onClick={() => setShowTimeline(true)}
                sx={{ mr: 1 }}
              >
                <TimelineIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="TI Allowance Calculator">
              <IconButton 
                color="primary" 
                onClick={() => {
                  setSelectedTenantIndex(activeTab);
                  setShowTICalculator(true);
                }}
                sx={{ mr: 1 }}
              >
                <CalculateIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="CAM Charge Allocator">
              <IconButton 
                color="primary" 
                onClick={() => setShowCAMAllocator(true)}
              >
                <ChartIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Formik
          initialValues={{ tenants: tenants.map(calculateDerivedValues) }}
          validationSchema={Yup.object({
            tenants: Yup.array().of(tenantValidationSchema),
          })}
          onSubmit={(values) => {
            console.log('Submitted tenants:', values.tenants);
            // Here you would save data to your backend
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <FieldArray name="tenants">
                {({ push, remove, replace }) => (
                  <Box>
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                    >
                      {values.tenants.map((tenant, index) => (
                        <Tab 
                          key={index} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography>{tenant.tenantName || `Tenant ${index + 1}`}</Typography>
                              {index > 0 && (
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    remove(index);
                                    if (activeTab >= values.tenants.length - 1) {
                                      setActiveTab(values.tenants.length - 2);
                                    }
                                  }}
                                  sx={{ ml: 1 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          } 
                        />
                      ))}
                    </Tabs>
                    
                    {values.tenants.map((tenant, index) => (
                      <div key={index} style={{ display: activeTab === index ? 'block' : 'none' }}>
                        <TenantLeaseForm 
                          tenant={tenant} 
                          prefix={`tenants[${index}]`} 
                          onChange={(updatedFields) => {
                            const updatedTenant = {
                              ...tenant,
                              ...updatedFields
                            };
                            const calculatedTenant = calculateDerivedValues(updatedTenant);
                            replace(index, calculatedTenant);
                          }}
                          onDuplicate={() => {
                            push({
                              ...tenant,
                              tenantName: `${tenant.tenantName} (Copy)`,
                            });
                            setActiveTab(values.tenants.length);
                          }}
                        />
                      </div>
                    ))}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Fab 
                        color="primary" 
                        aria-label="add tenant" 
                        onClick={() => {
                          push(initialTenant);
                          setActiveTab(values.tenants.length);
                        }}
                        size="medium"
                      >
                        <AddIcon />
                      </Fab>
                    </Box>
                  </Box>
                )}
              </FieldArray>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                >
                  Save All Leases
                </Button>
              </Box>
              
              {/* Timeline Dialog */}
              <LeaseTimeline 
                open={showTimeline} 
                onClose={() => setShowTimeline(false)}
                tenants={values.tenants}
              />
              
              {/* TI Allowance Calculator Dialog */}
              <TIAllowanceCalculator 
                open={showTICalculator} 
                onClose={() => setShowTICalculator(false)}
                tenant={values.tenants[selectedTenantIndex]}
                onSave={(updatedTenant) => {
                  const calculatedTenant = calculateDerivedValues(updatedTenant);
                  setFieldValue(`tenants[${selectedTenantIndex}]`, calculatedTenant);
                  setNotification({
                    open: true,
                    message: 'TI Allowance updated successfully',
                    severity: 'success'
                  });
                }}
              />
              
              {/* CAM Charge Allocator Dialog */}
              <CAMChargeAllocator 
                open={showCAMAllocator} 
                onClose={() => setShowCAMAllocator(false)}
                tenants={values.tenants}
                onSave={(updatedTenants) => {
                  updatedTenants.forEach((tenant, index) => {
                    setFieldValue(`tenants[${index}]`, calculateDerivedValues(tenant));
                  });
                  setNotification({
                    open: true,
                    message: 'CAM charges allocated successfully',
                    severity: 'success'
                  });
                }}
              />
              
              {/* Notification Snackbar */}
              <Snackbar 
                open={notification.open} 
                autoHideDuration={6000} 
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Alert 
                  onClose={() => setNotification({ ...notification, open: false })} 
                  severity={notification.severity}
                  sx={{ width: '100%' }}
                >
                  {notification.message}
                </Alert>
              </Snackbar>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default TenantLeaseManager;
