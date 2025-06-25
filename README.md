# Valuelyst - Commercial Property Appraisal Platform

## Overview
Valuelyst is a comprehensive commercial property appraisal platform that provides advanced valuation analytics, comparable property analysis, and detailed property data management with over 500 data points per property.

## Key Features Implemented

### Recent Major Updates
- Fixed Price Display: Properties now show correct prices from `raw_data.Price` field instead of zero values
- Clickable Data Points: Click any "X data points" chip to view all 500+ property details in a searchable modal
- Comprehensive Property Data: Full access to all imported Excel data fields
- Multiple Comparable Selection: Fixed duplicate detection to allow 3+ comparable properties
- Enhanced API Integration: Fixed valuation API endpoints and error handling

### Core Functionality
- Property Data Management: Import and manage comprehensive property datasets
- Comparable Property Analysis: Select and analyze multiple comparable properties
- Advanced Valuation Engine: USPAP-compliant appraisal calculations
- Interactive Data Exploration: Search, filter, and explore all property data points
- Adjustments & Calculations: Apply adjustments and view calculated valuations

## Quick Deploy to Vercel

### One-Click Deployment
1. Import this repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import `nelsonriches1/valuelyst`

2. Automatic Configuration:
   - Vercel will detect the configuration in `vercel.json`
   - Frontend builds automatically from `/client`
   - Backend API runs from `/backend/test-minimal.js`

3. Environment Variables (Optional):
   - `NODE_ENV=production` (set automatically)
   - All test data is included, no external database needed

## Local Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
```bash
# Clone repository
git clone https://github.com/nelsonriches1/valuelyst.git
cd valuelyst

# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Test Endpoint: http://localhost:3001/api/test

## Project Structure
```
valuelyst/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Main application pages
│   │   ├── components/    # Reusable components
│   │   └── context/       # State management
├── backend/               # Node.js backend
│   ├── controllers/       # API controllers
│   ├── services/         # Business logic
│   ├── database/         # SQLite database
│   └── test-minimal.js   # Lightweight server for deployment
├── vercel.json           # Vercel deployment configuration
└── package.json          # Root package configuration
```

## API Endpoints

### Available Endpoints
- `GET /api/test` - Health check
- `GET /api/properties/comps/available` - Get comparable properties
- `POST /api/properties/appraisal/generate` - Generate property valuation

## Data & Features

### Property Data Points
- 500+ Fields Per Property: Comprehensive Excel import data
- Financial Metrics: Sales prices, cap rates, income data
- Physical Attributes: Building size, lot size, construction details
- Location Data: Address, zoning, environmental factors
- Market Information: Sale dates, market trends, demographics

### Interactive Features
- Clickable Data Exploration: Click data point chips to view all details
- Advanced Search & Filter: Find specific property attributes quickly
- Copy & Download: Export property data as JSON
- Responsive Design: Works on desktop and mobile devices

## Technical Stack

### Frontend
- React 18 with functional components and hooks
- Material-UI (MUI) for consistent design system
- Axios for API communication
- React Router for navigation

### Backend
- Node.js with Express.js framework
- SQLite database with comprehensive property data
- USPAP-compliant appraisal engine
- RESTful API design

## Deployment Ready

This repository is configured for immediate deployment to Vercel:
- Vercel configuration included
- Build scripts optimized
- Database and test data included
- Environment variables configured
- API routes properly mapped

## Contributors
- safalaan hallow - Full-stack development and implementation

## License
MIT License - see LICENSE file for details

---

Ready for Production: This application is fully functional and deployment-ready with comprehensive property appraisal features and data management capabilities.
