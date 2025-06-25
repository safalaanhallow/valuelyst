const { Sequelize } = require('sequelize');
const path = require('path');

// Import our comprehensive appraisal engine
const AppraisalEngine = require('./services/appraisal/appraisalEngine');

async function testFullSystem() {
  try {
    console.log('🧪 Testing comprehensive appraisal system...');
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'database/valuelyst.sqlite'),
      logging: false
    });
    
    const SalesProperty = sequelize.define('sales_property', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      property_id: Sequelize.STRING,
      property_name: Sequelize.STRING,
      address: Sequelize.STRING,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      tax_id: Sequelize.STRING,
      sale_price: Sequelize.DECIMAL(15, 2),
      sale_date: Sequelize.STRING,
      building_size: Sequelize.DECIMAL(10, 2),
      lot_size: Sequelize.DECIMAL(10, 2),
      cap_rate: Sequelize.DECIMAL(5, 2),
      price_per_sf: Sequelize.DECIMAL(10, 2),
      property_type: Sequelize.STRING
    }, {
      tableName: 'sales_properties',
      timestamps: true
    });
    
    // Test 1: Get available comps (use properties with building sizes and assign prices)
    console.log('\n1️⃣ Testing available comps...');
    const allComps = await SalesProperty.findAll({
      where: { 
        property_name: { [Sequelize.Op.ne]: null },
        building_size: { [Sequelize.Op.gt]: 1000 } // Only properties with meaningful building sizes
      },
      order: [['building_size', 'DESC']], // Order by size for better test data
      limit: 10
    });
    
    console.log(`✅ Found ${allComps.length} properties available for selection`);
    
    if (allComps.length >= 3) {
      // Test 2: Select first 5 as comps for better analysis
      console.log('\n2️⃣ Testing comps selection and adding realistic sale prices...');
      const selectedIds = allComps.slice(0, Math.min(5, allComps.length)).map(p => p.id);
      console.log(`📋 Selected comps: ${selectedIds.join(', ')}`);
      
      const selectedComps = await SalesProperty.findAll({
        where: { id: { [Sequelize.Op.in]: selectedIds } }
      });
      
      // Add realistic sale prices based on building size (for demonstration)
      selectedComps.forEach(comp => {
        const buildingSize = parseFloat(comp.building_size) || 1000;
        const basePrice = 120; // $120 per square foot base
        const variance = 0.8 + (Math.random() * 0.4); // 80-120% variance
        comp.sale_price = Math.round(buildingSize * basePrice * variance);
        comp.price_per_sf = Math.round(comp.sale_price / buildingSize);
        comp.cap_rate = 0.06 + (Math.random() * 0.03); // 6-9% cap rate
      });
      
      console.log('✅ Selected comparable properties (with demo sale prices):');
      selectedComps.forEach((comp, index) => {
        console.log(`   ${index + 1}. ${comp.property_name || 'Unknown'}`);
        console.log(`      Price: $${comp.sale_price?.toLocaleString()} | Size: ${comp.building_size} sq ft | PSF: $${comp.price_per_sf}`);
        console.log(`      Type: ${comp.property_type} | Cap Rate: ${(comp.cap_rate * 100).toFixed(1)}%`);
      });
      
      // Test 3: Build comprehensive test data
      console.log('\n3️⃣ Building comprehensive test data...');
      
      // Create subject property
      const subjectProperty = {
        id: 999,
        propertyId: 'SUBJ-999',
        propertyType: 'Office',
        physical: {
          buildingArea: {
            grossBuildingArea: 15000,
            netRentableArea: 13500
          },
          landArea: {
            sf: 8000,
            acres: 0.18
          },
          construction: {
            yearBuilt: 2018,
            constructionType: 'steel_frame',
            exteriorFinish: 'glass',
            condition: 'good'
          },
          stories: 3,
          ceilingHeight: 9,
          parkingSpaces: 60
        },
        location: {
          address: "789 Test Subject Property Ave",
          city: "Business City",
          state: "ST",
          zipCode: "12345",
          neighborhood: "A-",
          market: "Primary"
        },
        legal: {
          propertyRights: "Fee Simple",
          zoning: "Commercial Office",
          easements: [],
          restrictions: []
        },
        income: {
          grossIncome: 450000, // $30/SF annual
          vacancy: 0.05,
          operatingExpenses: 157500, // $10.50/SF annual
          netOperatingIncome: 270000
        },
        occupancy: "Owner Occupied",
        condition: "Good"
      };
      
      // Transform comparables
      const comparables = selectedComps.map(comp => ({
        id: comp.id,
        propertyId: comp.property_id,
        propertyName: comp.property_name,
        address: comp.address,
        city: comp.city,
        state: comp.state,
        taxId: comp.tax_id,
        salePrice: parseFloat(comp.sale_price) || 0,
        saleDate: comp.sale_date,
        buildingSize: parseFloat(comp.building_size) || 0,
        lotSize: parseFloat(comp.lot_size) || 0,
        propertyType: comp.property_type,
        yearBuilt: 2015, // Default since not in database
        pricePerSF: parseFloat(comp.price_per_sf) || 0,
        capRate: parseFloat(comp.cap_rate) || null,
        annualNetIncome: null, // Not available in current database
        
        physical: {
          buildingArea: { grossBuildingArea: parseFloat(comp.building_size) || 0 },
          landArea: { sf: parseFloat(comp.lot_size) || 0 },
          construction: { yearBuilt: 2015, condition: 'average' }
        },
        location: {
          address: comp.address,
          city: comp.city,
          state: comp.state,
          neighborhood: 'B'
        },
        marketConditions: 'typical',
        propertyRights: 'fee_simple',
        financing: 'conventional'
      }));
      
      // Build market data
      const capRates = selectedComps
        .map(comp => parseFloat(comp.cap_rate))
        .filter(rate => rate > 0 && rate < 0.2);
      
      const avgCapRate = capRates.length > 0 ? 
        capRates.reduce((sum, rate) => sum + rate, 0) / capRates.length / 100 : 0.075;

      const marketData = {
        capRates: { 'Office': avgCapRate },
        expenseRatios: { 'Office': 0.35 },
        constructionCosts: { 'Office': 150 },
        marketConditions: 'balanced',
        appreciationRate: 0.03,
        landValueMultiplier: 1.0,
        costMultipliers: { 'Primary': 1.0 }
      };
      
      // Test 4: Initialize and run comprehensive appraisal
      console.log('\n4️⃣ Testing comprehensive appraisal engine...');
      console.log('🔄 Running comprehensive appraisal analysis...');
      const startTime = Date.now();
      
      try {
        const appraisalEngine = new AppraisalEngine();
        const appraisalResults = await appraisalEngine.generateAppraisal(
          subjectProperty,
          comparables,
          marketData,
          {
            userAdjustments: {},
            includeAllApproaches: true,
            generateDetailedReport: true,
            uspapCompliance: true
          }
        );
        
        const executionTime = Date.now() - startTime;
        console.log(`⚡ Appraisal completed in ${executionTime}ms`);
        
        // Test 5: Display comprehensive results
        console.log('\n5️⃣ COMPREHENSIVE APPRAISAL RESULTS:');
        console.log('=' .repeat(50));
        
        console.log(`\n💰 FINAL VALUE ESTIMATE: $${appraisalResults.finalValue?.toLocaleString()}`);
        
        if (appraisalResults.valueRange) {
          console.log(`📊 Value Range: $${appraisalResults.valueRange.low?.toLocaleString()} - $${appraisalResults.valueRange.high?.toLocaleString()}`);
          console.log(`🎯 Confidence Level: ${appraisalResults.confidenceScore?.toFixed(1)}%`);
        }
        
        console.log('\n📈 APPROACH VALUES & WEIGHTS:');
        if (appraisalResults.approaches) {
          Object.entries(appraisalResults.approaches).forEach(([approach, data]) => {
            console.log(`  ${approach}: $${data.value?.toLocaleString()} (Weight: ${(data.weight * 100)?.toFixed(1)}%)`);
          });
        }
        
        console.log('\n✅ VALIDATION RESULTS:');
        if (appraisalResults.validation) {
          console.log(`  Quality Score: ${appraisalResults.validation.qualityScore?.toFixed(1)}/100`);
          console.log(`  Data Completeness: ${appraisalResults.validation.completeness?.toFixed(1)}%`);
          
          if (appraisalResults.validation.warnings?.length > 0) {
            console.log(`  ⚠️  Warnings: ${appraisalResults.validation.warnings.length}`);
            appraisalResults.validation.warnings.slice(0, 3).forEach(warning => {
              console.log(`    - ${warning}`);
            });
          }
        }
        
        console.log('\n📋 RECONCILIATION NARRATIVE:');
        if (appraisalResults.reconciliation?.narrative) {
          const narrativeText = appraisalResults.reconciliation.narrative.conclusion || 
                               appraisalResults.reconciliation.narrative.weightingRationale || 
                               'Reconciliation narrative available';
          console.log(`  ${narrativeText.substring(0, 200)}...`);
        }
        
        console.log('\n🏆 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY! 🏆');
        
      } catch (error) {
        console.error('\n❌ Appraisal generation failed:', error.message);
        console.error('\n🔍 FULL ERROR STACK:');
        console.error(error.stack);
        console.error('\n🔍 DEBUG INFO:');
        console.error('Subject Property Data:');
        console.error(JSON.stringify(subjectProperty, null, 2));
        console.error('\nComparables Data (first one):');
        console.error(JSON.stringify(comparables[0], null, 2));
        return;
      }
      
    } else {
      console.log('❌ Not enough properties found for testing');
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('💥 Comprehensive system test failed:', error.message);
    console.error(error.stack);
  }
}

testFullSystem();
