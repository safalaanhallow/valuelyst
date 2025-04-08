# ValueLyst Property Database Schema

This document outlines the comprehensive property database schema implemented in ValueLyst, including all 235 fields organized by category.

## Overview

The property database is designed with flexibility in mind, using JSON structures to organize related fields while maintaining a clean database schema. The property model contains the following main categories:

1. Identification (18 fields)
2. Zoning (22 fields)
3. Physical Attributes (45 fields)
4. Environmental Characteristics (27 fields)
5. Accessibility & Location Features (30 fields)
6. Financial Information (93 fields)

## Property Model Structure

Each property record contains the following primary fields:

```javascript
{
  id: Integer,                 // Primary key, auto-incremented
  org_id: Integer,             // Organization ID (foreign key)
  identification: JSON,        // 18 identification fields
  zoning: JSON,                // 22 zoning fields
  physical: JSON,              // 45 physical attribute fields
  environmental: JSON,         // 27 environmental fields
  accessibility: JSON,         // 30 accessibility fields
  income: JSON,                // Income statements & rent roll data
  expenses: JSON,              // Operating expenses data
  debt: JSON,                  // Debt structure details
  valuations: JSON,            // Valuation metrics
  tenants: JSON,               // Tenant details and lease terms
  comps: JSON,                 // Comparable properties data
  adjustments: JSON,           // Adjustment factors for comps
  created_by: Integer,         // User ID who created the record
  updated_by: Integer,         // User ID who last updated the record
  createdAt: DateTime,         // Creation timestamp
  updatedAt: DateTime          // Last update timestamp
}
```

## Detailed Field Descriptions

### 1. Identification (25+ fields)

Includes basic property identifiers such as:
- Property ID
- Property Name
- Address
- City, County, State, Zip
- Country
- Latitude/Longitude
- Tax ID/APN (Assessor's Parcel Number)
- Legal Description
- Book/Page Reference Documents
- FIPS codes
- Market/Submarket
- CBSA Name (Core Based Statistical Area)
- Census Tract/Block
- MSA (Metropolitan Statistical Area)
- School District
- Township/Range
- Neighborhood
- Municipality
- Property Type/Subtype
- Other Database References

### 2. Zoning (30+ fields)

Includes zoning regulations and allowances such as:
- Zoning Designation/District
- Zoning Type
- Zoning Authority
- Zoning Comments/Summary
- FAR (Floor Area Ratio)
- Maximum Building Height
- Minimum Lot Area
- Maximum Site Coverage
- Front/Side/Back Yard Setback Distances
- Special Districts
- Permitted Uses
- Zoning Ordinance Documents
- Allowable Floor Area SF
- Allowable Units
- Zoned Density
- Opportunity Zone Status
- Land Use Designation
- Highest and Best Use
- Current Use/Proposed Use

### 3. Physical Attributes (60+ fields)

Includes physical characteristics such as:
- Land Area (Acres, SF, Usable Acres, Usable SF)
- Land Shape, Dimensions, Corner Status
- Land Units (Count and Type)
- Road Frontage (Primary, Secondary, Tertiary)
- Water Frontage and Effective Water Frontage
- View and Topography
- Year Built (Numeric)
- Building Areas:
  - GBA (Gross Building Area)
  - RA (Rentable Area)
  - GLA (Gross Leasable Area)
  - Office/Retail/Industrial/Multifamily Square Footage
  - Usable Area
  - Load Factor
- Construction Type and Class
- Building Quality and Condition
- Design Appeal and Finish Condition
- Number of Buildings and Stories
- Number of Units (by type: multifamily, office, retail, industrial)
- Number of Rooms, Beds, and Bathrooms
- Property Amenities
- Deferred Maintenance
- Renovations and Proportion Renovated
- Effective Age and Remaining Economic Life
- Ceiling/Clear Height and Column Spacing
- Foundation and Exterior Wall Types
- Roof Type and Cover
- Heating and Cooling Systems
- Number of Truck Doors, Elevators, Escalators
- Fire Sprinkler Type
- Basement Size and Use
- Parking (Spaces, Ratio, Types, Condition)
- Land-to-Building Ratio

### 4. Environmental Characteristics (30+ fields)

Includes environmental factors such as:
- Flood Zone Designation and FEMA Map Data
- Within 100 Year Flood Plain Status
- Area in Flood Zone
- Environmental Issues/Status
- Soil Type and Conditions
- Drainage Characteristics
- Contamination Information:
  - Type of Contamination
  - Environmental Concerns
  - Clean-up Costs
  - Responsible Party
  - Risk Profile
- Wetlands Status:
  - Wetland Acres
  - Wetlands Type
  - Percent Wetlands
- Special Land Classifications:
  - Tillable Acres and Percent Tillable
  - Woodland Acres
  - Waste Acres
  - Grazing Acres
  - Irrigated/Dry Acres
- Utilities Availability
- Water Rights
- Agricultural Use Data
- Mineral Rights Status
- Earthquake Hazard Risk and Zone
- Environmental Assessment/Compliance Reports

### 5. Accessibility & Location Features (35+ fields)

Includes location-related attributes such as:
- Access Rating
- Visibility Rating
- Proximity to Transit
- Rail Service Availability
- Traffic Count Data:
  - Primary/Secondary/Tertiary Traffic Counts
  - Traffic Survey Date
- Distance Metrics
- Location Description
- Anchor Tenants in Area
- Demographics:
  - Median Household Income
  - Median Home Value
  - District Spending
  - Student-Teacher Ratio
  - Enrollment Figures
- District URL and References
- Walkability Scores
- Parking Requirements
- Market Trends
- Access to Highways
- Proximity to Amenities
- Location Quality Metrics

### 6. Financial Information (100+ fields)

#### 6.1 Income Statements & Rent Roll Data
- PGI (Potential Gross Income):
  - PGI Total/Per SF/Per Unit
- EGI (Effective Gross Income):
  - EGI Total/Per SF/Per Unit
- Rental Income Breakdown:
  - Base Rent ($/SF Per Year or Per Month)
  - Percentage Rent
  - Current Rent/Effective Rent (Year/Month)
  - Rent Per SF/Month
  - CAM Reimbursements
  - Base Rent Abatement
  - Expense Reimbursements
  - Other Income and Description
- Occupancy and Vacancy Data:
  - Occupancy Rate (%)
  - Vacancy Rate (%)
  - Vacancy Amount/Per SF/Per Unit
  - Commercial Vacancy
- ADR (Average Daily Rate) for Hospitality
- Room Revenue Multiplier

#### 6.2 Expense Data
- Total Expenses:
  - Expense Ratio
  - Expense Per SF/Per Unit
- Property Taxes:
  - Total/Per SF/Per Unit/Per Acre/Per Land Unit
  - Tax Rate and Code
  - Assessment Information
  - Special Assessments
- Insurance Premiums
- Utilities Breakdown:
  - Total Utilities
  - Electric/Gas/Fuel Expenses
- Repairs & Maintenance:
  - Building Repairs
  - Roads and Grounds
- Cleaning and Janitorial
- Security
- Management Fees
- Payroll
- Advertising and Marketing
- General and Administrative
- Professional Services
- Leasing Commissions
- Reserves
- Ground Rent Expense (if applicable)

#### 6.3 Valuation Metrics
- Transaction Values:
  - Price (Actual/Total)
  - Price Per SF/Acre/Land SF/Unit/Bed/Room
  - Price Per FAR
  - Price Per Buildable SF
  - Price Per Primary Frontage Feet
- Cap Rate Metrics:
  - Cap Rate (Going-in)
  - Terminal Cap Rate (Exit)
  - TOS (Time of Sale) Cap Rate
- Income Multipliers:
  - EGIM (Effective Gross Income Multiplier)
  - PGIM (Potential Gross Income Multiplier)
  - NIM (Net Income Multiplier)
- NOI (Net Operating Income):
  - Total NOI
  - NOI Per SF/Unit/Bed
  - TOS NOI
- Discount Rate
- Holding Period (Years)
- Income/Expense Growth Rates
- Implied Value

#### 6.4 Assessment & Tax Information
- Assessment Year/Values:
  - Land Assessment
  - Improvement Assessment
  - Other Assessment
  - Total Assessment
- Tax Rate and Annual Taxes
- Equalization Ratio
- Historical Assessment Values (Multiple Years)
- Historical Taxes (Multiple Years)
- Tax Authority Information
- Assessor Website Reference

#### 6.5 Cost & Development Information
- Land Costs (Total and Per SF/Unit)
- Site Improvement Costs (Total and Per SF/Unit)
- Off-Site Improvement Costs (Total and Per SF/Unit)
- Building Improvement Costs (Total and Per SF/Unit)
- FFE Costs (Total and Per SF/Unit)
- Soft Costs (Total and Per SF/Unit)
- Contingency Costs (Total and Per SF/Unit)
- Developer's Fee (Total and Per SF/Unit)
- Total Development Costs (Total and Per SF/Unit)
- Cost Source Information

### 7. Tenant Information (80+ fields per tenant)

#### 7.1 Tenant Details and Lease Terms
- Tenant/Lessee Name
- Lessor Name
- Suite/Space Identification
- Lease Dates:
  - Lease Date (Signing)
  - Start Date
  - Expiry/Expire Date
  - Survey Date
  - Verification Date
- Lease Term (Years/Months)
- Lease Type (NNN, Gross, Modified Gross)
- Lease Transaction Type
- Space Type
- Size Details:
  - SF (Square Footage)
  - Size in Square Meters (M2)
  - Percent Office in Space
- Rent Structure:
  - Base Rent/Year, /Month, /SF, /SF/Month
  - Effective Rent/Year, /Month, /SF, /SF/Month
  - Current Rent/Month
  - Rent/SF, Rent/Month, Rent/SF/Month
  - Rent Per Square Meter (M2, M2/Month)
  - Rent Basis
- Escalations and Adjustments:
  - Escalation Clauses (% or Amount)
  - Rent Increased Status
- Expense Terms:
  - Expense Reimbursements
  - Expense Stop
  - Tenant CAM Charges
- Concessions:
  - Free Rent Period
  - Concessions Description
  - TI (Tenant Improvement) Allowance
- Options:
  - Renewal Options
  - Options to Terminate
  - Options to Expand/Contract
- Additional Terms:
  - Lease Conditions
  - Percent Rent (for retail)
  - Floor Level
  - Finish Level/Condition
  - Tenant Parking Allocation
  - Costs to Finish
  - Anchor Type Classification (for retail centers)
- Security Deposit Amount
- Tenant Credit Rating
- Personal Guarantees
- Operating Hours
- Signage Rights
- Data Source and Verification Source

### 8. Comparable Properties and Adjustments

#### 8.1 Comparable Properties Data
- Identification:
  - Comp Property Address, City, State, Zip
  - Property Type/Subtype
  - Grantor/Grantee
  - Distance from Subject Property
- Transaction Details:
  - Sale/Recording Date
  - Sale/Transaction Type
  - Price (Actual/Total)
  - Conditions of Sale
  - Financing Terms
  - Property Rights Conveyed
  - Days on Market
- Size and Physical Characteristics:
  - Building Size (GBA, RA, GLA)
  - Land Area (Acres, SF)
  - Year Built/Renovated
  - Building Quality and Condition
  - Number of Units/Stories/Buildings
  - Construction Type/Class
- Financial Metrics:
  - Price Per Square Foot (various measures)
  - Price Per Acre/Unit/Room/Bed
  - Cap Rate at Time of Sale (TOS)
  - NOI at Time of Sale
  - Occupancy Rate
  - EGIM/PGIM at Sale
  - Expense Ratio
- Sale Verification:
  - Verification Source and Date
  - Verification Phone
  - Data Source Reference
  - Books/Page or Reference Documents
- TOS (Time of Sale) Metrics:
  - TOS Number of Tenants
  - TOS Weighted Avg. Lease Term
  - TOS Vacancy Rate
  - TOS Tenancy Type
  - TOS Price Per Rentable Space

#### 8.2 Adjustment Factors
- Transaction Adjustments:
  - Property Rights Adjustment
  - Financing Terms Adjustment
  - Conditions of Sale Adjustment
  - Market Condition (Time) Adjustment
  - Expenditures After Sale Adjustment
- Physical Adjustments:
  - Location Adjustment
  - Size Adjustment
  - Age/Effective Age Adjustment
  - Condition Adjustment
  - Quality Adjustment
  - Construction Class Adjustment
  - Design/Appeal Adjustment
  - Floor/Height Adjustment
- Economic Adjustments:
  - Income/Expense Adjustment
  - Occupancy Adjustment
  - Tenant Quality Adjustment
  - Lease Terms Adjustment
  - Amenity Adjustment
- Special Adjustments:
  - Excess Land Adjustment
  - FF&E Adjustment
  - Business Value Adjustment
  - Environmental Adjustment
- Adjustment Results:
  - Adjusted Price Per Square Foot
  - Net Adjustment Percentage
  - Gross Adjustment Percentage
  - Weighted Importance Factor

## Access Control

Access to property data is controlled through role-based permissions:

1. **Admin**: Full access to all properties and fields
2. **Appraiser**: Can create and update properties within their organization, including all financial data
3. **Reviewer**: Can view all properties in their organization and update limited fields
4. **Client**: Read-only access to properties within their organization

All write operations (create, update, delete) require multi-factor authentication.
