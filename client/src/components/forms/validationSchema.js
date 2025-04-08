import * as Yup from 'yup';

// Validation schema for the Property Characteristics Form
export const PropertyFormValidationSchema = Yup.object({
  // Identification tab validations
  apn: Yup.string()
    .matches(/^\d{3}-\d{3}-\d{3}$/, 'APN must be in format 123-456-789')
    .required('APN is required'),
  lastSaleDate: Yup.date()
    .nullable()
    .required('Last sale date is required'),
  latitude: Yup.number()
    .nullable()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: Yup.number()
    .nullable()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  // Address fields validations
  streetAddress: Yup.string()
    .required('Street address is required'),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  zipCode: Yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Zip code must be in format 12345 or 12345-6789')
    .required('Zip code is required'),
  
  // Zoning tab validations
  overlayZones: Yup.array()
    .min(0, 'Select at least one overlay zone if applicable'),
  frontSetback: Yup.number()
    .min(0, 'Front setback must be a positive number')
    .required('Front setback is required'),
  rearSetback: Yup.number()
    .min(0, 'Rear setback must be a positive number')
    .required('Rear setback is required'),
  sideSetback: Yup.number()
    .min(0, 'Side setback must be a positive number')
    .required('Side setback is required'),
  parkingType: Yup.string()
    .required('Parking type is required'),
  
  // Physical Attributes tab validations
  effectiveAge: Yup.number()
    .min(1, 'Effective age must be at least 1 year')
    .max(100, 'Effective age must be at most 100 years')
    .required('Effective age is required'),
  yearBuilt: Yup.number()
    .min(1800, 'Year built must be after 1800')
    .max(new Date().getFullYear(), 'Year built cannot be in the future')
    .required('Year built is required'),
  floorPlateArea: Yup.number()
    .min(0, 'Floor plate area must be a positive number')
    .required('Floor plate area is required'),
  ceilingHeight: Yup.number()
    .min(0, 'Ceiling height must be a positive number')
    .required('Ceiling height is required'),
  // Building Systems
  hasHVAC: Yup.boolean(),
  hasSprinkler: Yup.boolean(),
  hasElevator: Yup.boolean(),
  hasSecuritySystem: Yup.boolean(),
  hasBMS: Yup.boolean(),
  hasGenerators: Yup.boolean(),
  hasEnergyManagement: Yup.boolean(),
  hasSmartLighting: Yup.boolean(),
});

// Validation schema for the Financials Input Form
export const FinancialsValidationSchema = Yup.object({
  // Income Statement validations
  baseRent: Yup.number()
    .min(0, 'Base rent must be a positive number')
    .required('Base rent is required'),
  percentageRent: Yup.number()
    .min(0, 'Percentage rent must be a positive number')
    .required('Percentage rent is required'),
  otherIncome: Yup.number()
    .min(0, 'Other income must be a positive number')
    .required('Other income is required'),
  expenseRecoveries: Yup.number()
    .min(0, 'Expense recoveries must be a positive number')
    .required('Expense recoveries is required'),
  vacancyRate: Yup.number()
    .min(0, 'Vacancy rate must be at least 0%')
    .max(25, 'Vacancy rate must be at most 25%')
    .required('Vacancy rate is required'),
  managementFeePercentage: Yup.number()
    .min(0, 'Management fee percentage must be at least 0%')
    .max(10, 'Management fee percentage must be at most 10%')
    .required('Management fee percentage is required'),
  
  // Expense Calculator validations
  expenseFrequency: Yup.string()
    .oneOf(['annual', 'monthly'], 'Expense frequency must be either annual or monthly')
    .required('Expense frequency is required'),
  propertyTaxes: Yup.number()
    .min(0, 'Property taxes must be a positive number')
    .required('Property taxes are required'),
  insurance: Yup.number()
    .min(0, 'Insurance must be a positive number')
    .required('Insurance is required'),
  utilities: Yup.number()
    .min(0, 'Utilities must be a positive number')
    .required('Utilities value is required'),
  repairsAndMaintenance: Yup.number()
    .min(0, 'Repairs and maintenance must be a positive number')
    .required('Repairs and maintenance is required'),
  
  // Debt Structure validations
  loanAmount: Yup.number()
    .min(0, 'Loan amount must be a positive number')
    .required('Loan amount is required'),
  interestRate: Yup.number()
    .min(0, 'Interest rate must be at least 0%')
    .max(25, 'Interest rate must be at most 25%')
    .required('Interest rate is required'),
  loanTerm: Yup.number()
    .min(1, 'Loan term must be at least 1 year')
    .max(40, 'Loan term must be at most 40 years')
    .required('Loan term is required'),
  amortizationPeriod: Yup.number()
    .min(1, 'Amortization period must be at least 1 year')
    .max(40, 'Amortization period must be at most 40 years')
    .required('Amortization period is required'),
  propertyValue: Yup.number()
    .min(0, 'Property value must be a positive number')
    .required('Property value is required'),
  prepaymentPenalty: Yup.boolean(),
  prepaymentYears: Yup.number()
    .when('prepaymentPenalty', {
      is: true,
      then: Yup.number()
        .min(1, 'Prepayment years must be at least 1')
        .max(10, 'Prepayment years must be at most 10')
        .required('Prepayment years is required when penalty is enabled'),
    }),
  prepaymentPercentage: Yup.number()
    .when('prepaymentPenalty', {
      is: true,
      then: Yup.number()
        .min(0, 'Prepayment percentage must be at least 0%')
        .max(5, 'Prepayment percentage must be at most 5%')
        .required('Prepayment percentage is required when penalty is enabled'),
    }),
  balloonPayment: Yup.boolean(),
  balloonYear: Yup.number()
    .when('balloonPayment', {
      is: true,
      then: Yup.number()
        .min(1, 'Balloon year must be at least 1')
        .test(
          'max-balloon-year',
          'Balloon year must be less than the loan term',
          function(value) {
            return value < this.parent.loanTerm;
          }
        )
        .required('Balloon year is required when balloon payment is enabled'),
    }),
});
