/**
 * Test report generation only
 */

const { generateAppraisalReport } = require('./services/appraisal/reportGeneration');

async function testReportGeneration() {
  try {
    console.log('🧪 Testing report generation only...');
    
    // Mock data structures
    const testData = {
      subjectProperty: {
        id: 999,
        propertyId: "SUBJ-999",
        propertyType: "Office",
        physical: {
          buildingArea: { grossBuildingArea: 15000, netRentableArea: 13500 },
          landArea: { sf: 8000, acres: 0.18 },
          construction: { yearBuilt: 2018, constructionType: "steel_frame", condition: "good" }
        },
        location: {
          address: "789 Test Subject Property Ave",
          city: "Business City",
          state: "ST",
          zipCode: "12345"
        }
      },
      comparables: [
        {
          propertyName: "Test Comparable 1",
          address: "123 Test St",
          salePrice: 1000000,
          buildingSize: 10000,
          pricePerSF: 100,
          propertyType: "Office"
        }
      ],
      marketData: {
        capRates: { office: 0.075 },
        constructionCosts: { office: 150 },
        expenseRatios: { office: 0.35 }
      },
      hbuAnalysis: {
        conclusion: "Office use as improved",
        reasoning: "Test reasoning"
      },
      approaches: {
        salesComparison: { 
          value: 2000000, 
          confidence: 85,
          comparables: [
            { id: 1, adjustedValue: 2000000 },
            { id: 2, adjustedValue: 1950000 }
          ]
        },
        incomeApproach: { value: 1950000, confidence: 80 },
        costApproach: { value: 2100000, confidence: 70 }
      },
      reconciliation: {
        finalValue: 2000000,
        confidence: 85,
        variance: { acceptable: true },
        valueRange: {
          low: 1900000,
          high: 2100000,
          percent: 10
        },
        approaches: {
          salesComparison: { 
            value: 2000000, 
            confidence: 85,
            valueIndication: 2000000,
            comparables: [
              { id: 1, adjustedValue: 2000000 },
              { id: 2, adjustedValue: 1950000 }
            ]
          },
          incomeApproach: { 
            value: 1950000, 
            confidence: 80,
            valueIndication: 1950000
          },
          costApproach: { 
            value: 2100000, 
            confidence: 70,
            valueIndication: 2100000
          }
        },
        weights: {
          sales: 0.70,
          income: 0.20,
          cost: 0.10
        },
        narrative: {
          weightingRationale: 'Sales comparison approach given highest weight due to strong comparable data.',
          varianceAnalysis: 'Value indications show acceptable variance within market expectations.',
          conclusion: 'The final value conclusion is well supported by market evidence.'
        }
      },
      validationResults: {
        errors: [],
        warnings: []
      },
      options: {
        reportType: "full"
      }
    };
    
    console.log('📄 Calling generateAppraisalReport...');
    const report = await generateAppraisalReport(testData);
    
    console.log('✅ Report generated successfully!');
    console.log('Report structure:', Object.keys(report));
    
  } catch (error) {
    console.error('❌ Report generation failed:');
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testReportGeneration();
