/**
 * Sales Comparison Approach Implementation
 * Industry Standard Methodology with Proper Adjustments
 */

const { validateComparables, rankComparables } = require('./comparableAnalysis');
const { calculateAdjustments } = require('./adjustmentCalculations');

/**
 * Calculate Sales Comparison Approach value
 */
async function calculateSalesComparison(subjectProperty, salesComparables, marketData) {
  console.log('📊 Starting Sales Comparison Approach...');
  
  // Step 1: Verify and filter comparables
  const verifiedComps = await verifyComparables(salesComparables, subjectProperty);
  console.log(`✅ Verified ${verifiedComps.length} comparable sales`);
  
  // Step 2: Rank comparables by similarity
  const rankedComps = await rankComparables(subjectProperty, verifiedComps);
  
  // Step 3: Select best comparables (minimum 3, maximum 6)
  const selectedComps = rankedComps.slice(0, Math.min(6, rankedComps.length));
  
  // Step 4: Apply comprehensive adjustments
  const adjustedComps = await Promise.all(
    selectedComps.map(comp => applyComprehensiveAdjustments(subjectProperty, comp, marketData))
  );
  
  // Step 5: Calculate value indication
  const valueIndication = calculateValueIndication(adjustedComps, subjectProperty);
  
  // Step 6: Analyze reliability
  const reliability = analyzeReliability(adjustedComps, valueIndication);
  
  return {
    approach: 'Sales Comparison',
    comparables: adjustedComps,
    valueIndication: valueIndication.value,
    valueRange: valueIndication.range,
    confidence: reliability.confidence,
    dataQuality: reliability.dataQuality,
    adjustmentSummary: generateAdjustmentSummary(adjustedComps),
    narrative: generateSalesComparisonNarrative(adjustedComps, valueIndication),
    compliance: {
      minimumComps: adjustedComps.length >= 3,
      adjustmentLimits: validateAdjustmentLimits(adjustedComps),
      timeframe: validateTimeframe(adjustedComps)
    }
  };
}

/**
 * Verify comparables meet minimum standards
 */
async function verifyComparables(comparables, subjectProperty) {
  const verified = [];
  
  for (const comp of comparables) {
    const verification = {
      comparable: comp,
      verificationStatus: 'verified',
      issues: []
    };
    
    // Verify sale date (within 24 months preferred, 36 months max)
    const saleDate = new Date(comp.saleDate);
    const monthsAgo = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsAgo > 36) {
      verification.issues.push('Sale date exceeds 36 months');
      continue; // Skip this comparable
    } else if (monthsAgo > 24) {
      verification.issues.push('Sale date exceeds 24 months - requires significant time adjustment');
    }
    
    // Verify property type compatibility
    if (!isCompatiblePropertyType(subjectProperty.propertyType, comp.propertyType)) {
      verification.issues.push('Incompatible property type');
      continue;
    }
    
    // Verify size range (within 300% of subject)
    const sizeRatio = comp.buildingArea / subjectProperty.physical.buildingArea.netRentableArea;
    if (sizeRatio > 3 || sizeRatio < 0.33) {
      verification.issues.push('Size difference too extreme');
      continue;
    }
    
    // Verify arms-length transaction
    if (comp.saleConditions && comp.saleConditions.toLowerCase().includes('distressed')) {
      verification.issues.push('Distressed sale conditions');
    }
    
    // Add verification data to comparable
    comp.verification = verification;
    verified.push(comp);
  }
  
  return verified;
}

/**
 * Apply comprehensive adjustments to comparable
 */
async function applyComprehensiveAdjustments(subjectProperty, comparable, marketData) {
  const adjustments = {};
  
  // 1. Property Rights Conveyed
  adjustments.propertyRights = calculatePropertyRightsAdjustment(subjectProperty, comparable);
  
  // 2. Financing Terms
  adjustments.financing = calculateFinancingAdjustment(comparable, marketData);
  
  // 3. Conditions of Sale
  adjustments.saleConditions = calculateSaleConditionsAdjustment(comparable);
  
  // 4. Market Conditions (Time)
  adjustments.marketConditions = calculateTimeAdjustment(comparable.saleDate, marketData);
  
  // 5. Location
  adjustments.location = calculateLocationAdjustment(subjectProperty, comparable, marketData);
  
  // 6. Physical Characteristics
  adjustments.size = calculateSizeAdjustment(subjectProperty, comparable);
  adjustments.age = calculateAgeAdjustment(subjectProperty, comparable);
  adjustments.condition = calculateConditionAdjustment(subjectProperty, comparable);
  adjustments.quality = calculateQualityAdjustment(subjectProperty, comparable);
  adjustments.functionalUtility = calculateFunctionalUtilityAdjustment(subjectProperty, comparable);
  
  // 7. Income Characteristics (for income-producing properties)
  if (subjectProperty.income && comparable.income) {
    adjustments.leaseTerms = calculateLeaseTermsAdjustment(subjectProperty, comparable);
    adjustments.tenantQuality = calculateTenantQualityAdjustment(subjectProperty, comparable);
  }
  
  // Calculate total adjustments
  const dollarAdjustments = Object.values(adjustments)
    .filter(adj => adj.type === 'dollar')
    .reduce((sum, adj) => sum + adj.amount, 0);
    
  const percentAdjustments = Object.values(adjustments)
    .filter(adj => adj.type === 'percent')
    .reduce((product, adj) => product * (1 + adj.amount), 1) - 1;
  
  // Apply adjustments
  const adjustedPrice = (comparable.salePrice + dollarAdjustments) * (1 + percentAdjustments);
  const adjustedPricePSF = adjustedPrice / subjectProperty.physical.buildingArea.netRentableArea;
  
  // Validate adjustment limits
  const totalNetAdjustment = Math.abs(dollarAdjustments / comparable.salePrice + percentAdjustments);
  const adjustmentValid = totalNetAdjustment <= 0.5; // 50% limit
  
  return {
    ...comparable,
    adjustments,
    adjustedPrice,
    adjustedPricePSF,
    totalDollarAdjustment: dollarAdjustments,
    totalPercentAdjustment: percentAdjustments,
    totalNetAdjustment,
    adjustmentValid,
    weight: calculateComparableWeight(adjustments, totalNetAdjustment)
  };
}

/**
 * Calculate final value indication from adjusted comparables
 */
function calculateValueIndication(adjustedComps, subjectProperty) {
  const validComps = adjustedComps.filter(comp => comp.adjustmentValid);
  
  if (validComps.length < 3) {
    throw new Error('Insufficient valid comparables after adjustments');
  }
  
  // Calculate weighted average
  const totalWeight = validComps.reduce((sum, comp) => sum + comp.weight, 0);
  const weightedPrice = validComps.reduce((sum, comp) => 
    sum + (comp.adjustedPricePSF * comp.weight), 0) / totalWeight;
  
  // Calculate statistics
  const prices = validComps.map(comp => comp.adjustedPricePSF);
  const mean = prices.reduce((a, b) => a + b) / prices.length;
  const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
  const standardDev = Math.sqrt(prices.reduce((sum, price) => 
    sum + Math.pow(price - mean, 2), 0) / prices.length);
  
  // Final value calculation
  const indicatedValuePSF = weightedPrice;
  const indicatedValue = indicatedValuePSF * subjectProperty.physical.buildingArea.netRentableArea;
  
  // Value range based on standard deviation
  const coefficient = standardDev / mean;
  const rangePercent = Math.min(0.15, Math.max(0.05, coefficient)); // 5-15% range
  
  return {
    value: Math.round(indicatedValue),
    valuePSF: Math.round(indicatedValuePSF * 100) / 100,
    range: {
      low: Math.round(indicatedValue * (1 - rangePercent)),
      high: Math.round(indicatedValue * (1 + rangePercent))
    },
    statistics: {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      standardDeviation: Math.round(standardDev * 100) / 100,
      coefficientOfVariation: Math.round(coefficient * 100) / 100
    },
    methodology: 'weighted_average'
  };
}

/**
 * Calculate reliability and confidence metrics
 */
function analyzeReliability(adjustedComps, valueIndication) {
  let confidence = 100;
  let dataQuality = 'high';
  
  // Reduce confidence based on number of comparables
  if (adjustedComps.length < 4) confidence -= 10;
  if (adjustedComps.length < 3) confidence -= 20;
  
  // Reduce confidence based on adjustment magnitude
  const avgAdjustment = adjustedComps.reduce((sum, comp) => 
    sum + comp.totalNetAdjustment, 0) / adjustedComps.length;
  
  if (avgAdjustment > 0.3) confidence -= 15;
  if (avgAdjustment > 0.4) confidence -= 25;
  
  // Reduce confidence based on value variance
  if (valueIndication.statistics.coefficientOfVariation > 0.15) {
    confidence -= 20;
    dataQuality = 'medium';
  }
  
  // Reduce confidence based on sale dates
  const avgMonthsOld = adjustedComps.reduce((sum, comp) => {
    const months = (Date.now() - new Date(comp.saleDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return sum + months;
  }, 0) / adjustedComps.length;
  
  if (avgMonthsOld > 18) confidence -= 10;
  if (avgMonthsOld > 24) confidence -= 20;
  
  confidence = Math.max(0, Math.min(100, confidence));
  
  if (confidence < 60) dataQuality = 'low';
  else if (confidence < 80) dataQuality = 'medium';
  
  return {
    confidence: Math.round(confidence),
    dataQuality,
    factors: {
      comparableCount: adjustedComps.length,
      averageAdjustment: Math.round(avgAdjustment * 100),
      valueVariance: Math.round(valueIndication.statistics.coefficientOfVariation * 100),
      averageAge: Math.round(avgMonthsOld)
    }
  };
}

/**
 * Helper function to check property type compatibility
 */
function isCompatiblePropertyType(subjectType, compType) {
  const compatibilityMatrix = {
    'Office': ['Office', 'Mixed Use'],
    'Retail': ['Retail', 'Mixed Use'],
    'Industrial': ['Industrial', 'Warehouse'],
    'Warehouse': ['Industrial', 'Warehouse'],
    'Mixed Use': ['Mixed Use', 'Office', 'Retail'],
    'Multifamily': ['Multifamily', 'Apartment']
  };
  
  return compatibilityMatrix[subjectType]?.includes(compType) || false;
}

/**
 * Calculate comparable weight based on adjustments
 */
function calculateComparableWeight(adjustments, totalNetAdjustment) {
  // Base weight of 1.0, reduced by adjustment magnitude
  let weight = 1.0;
  
  // Reduce weight based on total adjustments
  weight *= (1 - Math.min(0.5, totalNetAdjustment));
  
  // Reduce weight for specific high-impact adjustments
  if (adjustments.location && Math.abs(adjustments.location.amount) > 0.1) {
    weight *= 0.9;
  }
  
  if (adjustments.marketConditions && Math.abs(adjustments.marketConditions.amount) > 0.1) {
    weight *= 0.9;
  }
  
  return Math.max(0.1, weight); // Minimum weight of 0.1
}

/**
 * Generate adjustment summary
 */
function generateAdjustmentSummary(adjustedComps) {
  const summary = {
    averageAdjustments: {},
    adjustmentRanges: {},
    commonIssues: []
  };
  
  // Calculate average adjustments by type
  const adjustmentTypes = ['location', 'size', 'age', 'condition', 'marketConditions'];
  
  adjustmentTypes.forEach(type => {
    const adjustments = adjustedComps
      .map(comp => comp.adjustments[type]?.amount || 0)
      .filter(adj => adj !== 0);
      
    if (adjustments.length > 0) {
      summary.averageAdjustments[type] = {
        average: adjustments.reduce((a, b) => a + b) / adjustments.length,
        count: adjustments.length
      };
      
      summary.adjustmentRanges[type] = {
        min: Math.min(...adjustments),
        max: Math.max(...adjustments)
      };
    }
  });
  
  return summary;
}

/**
 * Generate narrative for sales comparison approach
 */
function generateSalesComparisonNarrative(adjustedComps, valueIndication) {
  return {
    summary: `The Sales Comparison Approach analyzed ${adjustedComps.length} comparable sales, resulting in an indicated value of $${valueIndication.value.toLocaleString()} or $${valueIndication.valuePSF}/SF.`,
    
    comparableAnalysis: adjustedComps.map(comp => ({
      property: comp.propertyAddress,
      salePrice: comp.salePrice,
      adjustedPrice: comp.adjustedPrice,
      keyAdjustments: Object.entries(comp.adjustments)
        .filter(([key, adj]) => Math.abs(adj.amount) > 0.05)
        .map(([key, adj]) => `${key}: ${adj.amount > 0 ? '+' : ''}${(adj.amount * 100).toFixed(1)}%`)
    })),
    
    conclusion: `Based on the analysis of comparable sales with appropriate adjustments for differences in location, size, age, condition, and market conditions, the Sales Comparison Approach indicates a value of $${valueIndication.value.toLocaleString()} for the subject property.`,
    
    reliability: `This indication is considered ${valueIndication.statistics.coefficientOfVariation < 0.1 ? 'highly reliable' : valueIndication.statistics.coefficientOfVariation < 0.2 ? 'reliable' : 'moderately reliable'} based on the quality and quantity of comparable data available.`
  };
}

/**
 * Validate adjustment limits per industry standards
 */
function validateAdjustmentLimits(adjustedComps) {
  const violations = [];
  
  adjustedComps.forEach((comp, index) => {
    if (comp.totalNetAdjustment > 0.5) {
      violations.push(`Comparable ${index + 1}: Total adjustments exceed 50% (${(comp.totalNetAdjustment * 100).toFixed(1)}%)`);
    }
    
    // Check individual adjustment limits
    Object.entries(comp.adjustments).forEach(([type, adjustment]) => {
      if (Math.abs(adjustment.amount) > 0.3) {
        violations.push(`Comparable ${index + 1}: ${type} adjustment exceeds 30% (${(adjustment.amount * 100).toFixed(1)}%)`);
      }
    });
  });
  
  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Validate timeframe requirements
 */
function validateTimeframe(adjustedComps) {
  const violations = [];
  
  adjustedComps.forEach((comp, index) => {
    const monthsAgo = (Date.now() - new Date(comp.saleDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsAgo > 36) {
      violations.push(`Comparable ${index + 1}: Sale date exceeds 36 months (${monthsAgo.toFixed(1)} months)`);
    }
  });
  
  return {
    valid: violations.length === 0,
    violations,
    averageAge: adjustedComps.reduce((sum, comp) => {
      const months = (Date.now() - new Date(comp.saleDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return sum + months;
    }, 0) / adjustedComps.length
  };
}

module.exports = {
  calculateSalesComparison,
  verifyComparables,
  applyComprehensiveAdjustments,
  calculateValueIndication,
  analyzeReliability
};
