import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import CompsSelector from '../appraisal/CompsSelector';
import AppraisalReport from '../appraisal/AppraisalReport';

const AppraisalTest = () => {
  const [step, setStep] = useState(1);
  const [selectedComps, setSelectedComps] = useState(null);
  const [appraisal, setAppraisal] = useState(null);

  const handleCompsSelected = (compsData) => {
    setSelectedComps(compsData);
    setStep(2);
  };

  const mockAppraisal = {
    subject_property: {
      property_name: "Test Subject Property",
      address: "123 Test St",
      building_size: 14000
    },
    comparable_sales: [
      {
        id: 1,
        property_name: "Office Building Downtown",
        sale_price: 2500000,
        building_size: 15000,
        price_per_sf: 167,
        total_adjustment: 50000,
        adjusted_price: 2550000,
        adjusted_price_per_sf: 170
      }
    ],
    valuation_summary: {
      sales_comparison_approach: {
        average_price: 2400000,
        median_price: 2500000,
        average_price_per_sf: 160,
        estimated_value: 2240000
      },
      income_approach: {
        net_operating_income: 150000,
        market_cap_rate: 6.7,
        estimated_value: 2238806
      },
      final_estimate: 2239361
    },
    analysis_date: new Date().toISOString(),
    appraiser: {
      name: "Test Appraiser",
      title: "Commercial Analyst"
    }
  };

  const simulateAppraisal = () => {
    setAppraisal(mockAppraisal);
    setStep(3);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Appraisal System Test
      </Typography>
      
      {step === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Step 1: Test Comps Selection
          </Typography>
          <CompsSelector
            propertyId={999}
            onCompsSelected={handleCompsSelected}
          />
        </Paper>
      )}
      
      {step === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Step 2: Generate Test Appraisal
          </Typography>
          <Typography variant="body1" paragraph>
            Selected {selectedComps?.selectedCompIds?.length || 0} comparable properties.
          </Typography>
          <Button 
            variant="contained" 
            onClick={simulateAppraisal}
            sx={{ mr: 2 }}
          >
            Generate Test Appraisal
          </Button>
          <Button onClick={() => setStep(1)}>
            Back to Comps Selection
          </Button>
        </Paper>
      )}
      
      {step === 3 && (
        <Paper sx={{ p: 3 }}>
          <AppraisalReport
            appraisal={appraisal}
            onPrint={() => console.log('Print clicked')}
            onDownload={() => console.log('Download clicked')}
          />
          <Box sx={{ mt: 3 }}>
            <Button onClick={() => setStep(1)} variant="outlined">
              Start New Test
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AppraisalTest;
