/**
 * Value Reconciliation Module
 * Professional reconciliation of the three approaches to value
 */

/**
 * Reconcile all approaches to final value conclusion
 */
async function reconcileToFinalValue(salesComparison, incomeApproach, costApproach, subjectProperty, options = {}) {
  console.log('⚖️ Starting value reconciliation...');
  
  // Analyze reliability of each approach
  const reliability = analyzeApproachReliability(salesComparison, incomeApproach, costApproach, subjectProperty);
  
  // Determine weights based on reliability and property characteristics
  const weights = determineReconciliationWeights(reliability, subjectProperty, options);
  
  // Calculate weighted value
  const weightedValue = calculateWeightedValue(salesComparison, incomeApproach, costApproach, weights);
  
  // Analyze value variance
  const variance = analyzeValueVariance(salesComparison, incomeApproach, costApproach);
  
  // Final value conclusion with professional rounding
  const finalValue = roundToAppropriateLevel(weightedValue, subjectProperty);
  
  // Calculate value range
  const valueRange = calculateValueRange(finalValue, variance, reliability);
  
  // Generate reconciliation narrative
  const narrative = generateReconciliationNarrative(
    salesComparison, incomeApproach, costApproach, 
    weights, finalValue, reliability, variance
  );
  
  return {
    approaches: {
      salesComparison: salesComparison || null,
      incomeApproach: incomeApproach || null,
      costApproach: costApproach || null
    },
    reliability,
    weights,
    weightedValue,
    finalValue,
    valueRange,
    variance,
    narrative,
    reconciliationDate: new Date().toISOString(),
    confidence: calculateOverallConfidence(reliability, variance, weights)
  };
}

/**
 * Analyze reliability of each approach
 */
function analyzeApproachReliability(salesComparison, incomeApproach, costApproach, subjectProperty) {
  const reliability = {};
  
  // Sales Comparison Approach reliability
  if (salesComparison) {
    let salesReliability = 'high';
    let salesScore = 100;
    const factors = [];
    
    // Number and quality of comparables
    if (salesComparison.comparables.length < 3) {
      salesScore -= 20;
      salesReliability = 'medium';
      factors.push('Limited comparable sales');
    }
    
    // Adjustment magnitude
    const avgAdjustment = salesComparison.comparables.reduce((sum, comp) => 
      sum + (comp.totalNetAdjustment || 0), 0) / salesComparison.comparables.length;
    
    if (avgAdjustment > 0.3) {
      salesScore -= 25;
      salesReliability = 'medium';
      factors.push('High adjustment levels');
    }
    
    // Market activity
    if (salesComparison.comparables.every(comp => {
      const months = (Date.now() - new Date(comp.saleDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return months > 18;
    })) {
      salesScore -= 15;
      factors.push('Dated sales data');
    }
    
    if (salesScore < 60) salesReliability = 'low';
    
    reliability.salesComparison = {
      level: salesReliability,
      score: Math.max(0, salesScore),
      factors,
      weight: calculateApproachWeight('sales', salesReliability, subjectProperty)
    };
  }
  
  // Income Approach reliability
  if (incomeApproach) {
    let incomeReliability = 'high';
    let incomeScore = 100;
    const factors = [];
    
    // Income data quality
    if (!subjectProperty.income?.rentRoll || subjectProperty.income.rentRoll.length === 0) {
      incomeScore -= 30;
      incomeReliability = 'medium';
      factors.push('Limited rent roll data');
    }
    
    // Market cap rate support
    if (!incomeApproach.directCapitalization?.capitalizationRate?.marketSupport) {
      incomeScore -= 20;
      factors.push('Limited cap rate market support');
    }
    
    // Property type suitability
    const incomeProducingTypes = ['Office', 'Retail', 'Industrial', 'Multifamily'];
    if (!incomeProducingTypes.includes(subjectProperty.propertyType)) {
      incomeScore -= 25;
      incomeReliability = 'medium';
      factors.push('Limited income-producing nature');
    }
    
    if (incomeScore < 60) incomeReliability = 'low';
    
    reliability.incomeApproach = {
      level: incomeReliability,
      score: Math.max(0, incomeScore),
      factors,
      weight: calculateApproachWeight('income', incomeReliability, subjectProperty)
    };
  }
  
  // Cost Approach reliability
  if (costApproach) {
    let costReliability = costApproach.applicability || 'medium';
    let costScore = 70; // Generally less reliable for existing properties
    const factors = [];
    
    const buildingAge = new Date().getFullYear() - subjectProperty.physical.construction.yearBuilt;
    
    if (buildingAge < 5) {
      costScore = 90;
      costReliability = 'high';
      factors.push('New construction');
    } else if (buildingAge > 20) {
      costScore = 50;
      costReliability = 'low';
      factors.push('Older building with depreciation uncertainty');
    }
    
    // Special use properties
    if (subjectProperty.physical.specialUse) {
      costScore += 15;
      factors.push('Special use property - limited sales data');
    }
    
    reliability.costApproach = {
      level: costReliability,
      score: Math.max(0, costScore),
      factors,
      weight: calculateApproachWeight('cost', costReliability, subjectProperty)
    };
  }
  
  return reliability;
}

/**
 * Determine reconciliation weights
 */
function determineReconciliationWeights(reliability, subjectProperty, options) {
  // Start with base weights based on property type
  let weights = getBaseWeights(subjectProperty.propertyType);
  
  // Adjust based on reliability scores
  if (reliability.salesComparison) {
    weights.sales *= (reliability.salesComparison.score / 100);
  } else {
    weights.sales = 0;
  }
  
  if (reliability.incomeApproach) {
    weights.income *= (reliability.incomeApproach.score / 100);
  } else {
    weights.income = 0;
  }
  
  if (reliability.costApproach) {
    weights.cost *= (reliability.costApproach.score / 100);
  } else {
    weights.cost = 0;
  }
  
  // Apply user preferences if specified
  if (options.preferredApproach) {
    applyUserPreferences(weights, options.preferredApproach);
  }
  
  // Normalize weights to sum to 1.0
  const totalWeight = weights.sales + weights.income + weights.cost;
  if (totalWeight > 0) {
    weights.sales /= totalWeight;
    weights.income /= totalWeight;
    weights.cost /= totalWeight;
  } else {
    // Fallback if all approaches have zero weight
    weights = { sales: 0.5, income: 0.4, cost: 0.1 };
  }
  
  return {
    sales: Math.round(weights.sales * 1000) / 1000,
    income: Math.round(weights.income * 1000) / 1000,
    cost: Math.round(weights.cost * 1000) / 1000
  };
}

/**
 * Calculate weighted value
 */
function calculateWeightedValue(salesComparison, incomeApproach, costApproach, weights) {
  let weightedValue = 0;
  
  if (salesComparison && weights.sales > 0) {
    weightedValue += salesComparison.valueIndication * weights.sales;
  }
  
  if (incomeApproach && weights.income > 0) {
    weightedValue += incomeApproach.valueIndication * weights.income;
  }
  
  if (costApproach && weights.cost > 0) {
    weightedValue += costApproach.valueIndication * weights.cost;
  }
  
  return Math.round(weightedValue);
}

/**
 * Analyze variance between approaches
 */
function analyzeValueVariance(salesComparison, incomeApproach, costApproach) {
  const values = [];
  
  if (salesComparison) values.push(salesComparison.valueIndication);
  if (incomeApproach) values.push(incomeApproach.valueIndication);
  if (costApproach) values.push(costApproach.valueIndication);
  
  if (values.length < 2) {
    return { variance: 0, range: 0, acceptable: true };
  }
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDev = Math.sqrt(variance);
  const coefficientOfVariation = standardDev / mean;
  
  const range = (Math.max(...values) - Math.min(...values)) / mean;
  const acceptable = range <= 0.25; // 25% variance generally acceptable
  
  return {
    values,
    mean: Math.round(mean),
    variance: Math.round(variance),
    standardDeviation: Math.round(standardDev),
    coefficientOfVariation: Math.round(coefficientOfVariation * 1000) / 1000,
    range: Math.round(range * 1000) / 1000,
    acceptable,
    analysis: range <= 0.1 ? 'excellent' : range <= 0.2 ? 'good' : range <= 0.3 ? 'acceptable' : 'poor'
  };
}

/**
 * Round final value to appropriate level
 */
function roundToAppropriateLevel(value, subjectProperty) {
  // Professional rounding standards
  if (value >= 10000000) return Math.round(value / 100000) * 100000; // Round to $100k
  if (value >= 1000000) return Math.round(value / 10000) * 10000;   // Round to $10k
  if (value >= 100000) return Math.round(value / 1000) * 1000;      // Round to $1k
  if (value >= 10000) return Math.round(value / 500) * 500;         // Round to $500
  return Math.round(value / 100) * 100;                             // Round to $100
}

/**
 * Calculate value range
 */
function calculateValueRange(finalValue, variance, reliability) {
  // Range based on variance and confidence
  let rangePercent = 0.05; // Base 5% range
  
  // Adjust based on variance
  if (variance.range > 0.2) rangePercent += 0.05;
  if (variance.range > 0.3) rangePercent += 0.05;
  
  // Adjust based on overall reliability
  const avgReliability = Object.values(reliability).reduce((sum, rel) => 
    sum + rel.score, 0) / Object.keys(reliability).length;
  
  if (avgReliability < 70) rangePercent += 0.05;
  if (avgReliability < 50) rangePercent += 0.05;
  
  rangePercent = Math.min(0.2, rangePercent); // Cap at 20%
  
  return {
    low: Math.round(finalValue * (1 - rangePercent)),
    high: Math.round(finalValue * (1 + rangePercent)),
    percent: Math.round(rangePercent * 100)
  };
}

/**
 * Helper functions
 */

function getBaseWeights(propertyType) {
  const weightsByType = {
    'Office': { sales: 0.5, income: 0.4, cost: 0.1 },
    'Retail': { sales: 0.4, income: 0.5, cost: 0.1 },
    'Industrial': { sales: 0.6, income: 0.3, cost: 0.1 },
    'Warehouse': { sales: 0.6, income: 0.3, cost: 0.1 },
    'Multifamily': { sales: 0.3, income: 0.6, cost: 0.1 },
    'Mixed Use': { sales: 0.4, income: 0.5, cost: 0.1 }
  };
  
  return weightsByType[propertyType] || { sales: 0.5, income: 0.4, cost: 0.1 };
}

function calculateApproachWeight(approach, reliability, subjectProperty) {
  const baseWeights = getBaseWeights(subjectProperty.propertyType);
  const reliabilityMultiplier = reliability === 'high' ? 1.2 : reliability === 'medium' ? 1.0 : 0.7;
  
  return baseWeights[approach === 'sales' ? 'sales' : approach === 'income' ? 'income' : 'cost'] * reliabilityMultiplier;
}

function calculateOverallConfidence(reliability, variance, weights) {
  // Weighted average of approach confidences
  let totalConfidence = 0;
  let totalWeight = 0;
  
  Object.entries(reliability).forEach(([approach, rel]) => {
    const weight = approach === 'salesComparison' ? weights.sales : 
                  approach === 'incomeApproach' ? weights.income : weights.cost;
    totalConfidence += rel.score * weight;
    totalWeight += weight;
  });
  
  let confidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;
  
  // Reduce confidence based on variance
  if (variance.range > 0.2) confidence *= 0.9;
  if (variance.range > 0.3) confidence *= 0.8;
  
  return Math.round(Math.max(0, Math.min(100, confidence)));
}

function generateReconciliationNarrative(salesComparison, incomeApproach, costApproach, weights, finalValue, reliability, variance) {
  const narrative = {
    summary: `Based on the analysis of ${Object.keys(reliability).length} approaches to value, the final value conclusion is $${finalValue.toLocaleString()}.`,
    
    approachAnalysis: {},
    
    weightingRationale: `The approaches were weighted as follows: ${weights.sales > 0 ? `Sales Comparison ${Math.round(weights.sales * 100)}%` : ''}${weights.income > 0 ? `, Income Approach ${Math.round(weights.income * 100)}%` : ''}${weights.cost > 0 ? `, Cost Approach ${Math.round(weights.cost * 100)}%` : ''}.`,
    
    varianceAnalysis: variance.acceptable ? 
      `The variance between approaches is ${variance.analysis} (${Math.round(variance.range * 100)}%), indicating consistent value indications.` :
      `The variance between approaches is ${variance.analysis} (${Math.round(variance.range * 100)}%), which requires careful consideration of each approach's reliability.`,
    
    conclusion: `The final value of $${finalValue.toLocaleString()} represents the most probable market value based on the weight of evidence from the applicable approaches.`
  };
  
  // Add individual approach narratives
  if (salesComparison) {
    narrative.approachAnalysis.salesComparison = `Sales Comparison Approach: $${salesComparison.valueIndication.toLocaleString()} (${Math.round(weights.sales * 100)}% weight) - ${reliability.salesComparison.level} reliability`;
  }
  
  if (incomeApproach) {
    narrative.approachAnalysis.incomeApproach = `Income Approach: $${incomeApproach.valueIndication.toLocaleString()} (${Math.round(weights.income * 100)}% weight) - ${reliability.incomeApproach.level} reliability`;
  }
  
  if (costApproach) {
    narrative.approachAnalysis.costApproach = `Cost Approach: $${costApproach.valueIndication.toLocaleString()} (${Math.round(weights.cost * 100)}% weight) - ${reliability.costApproach.level} reliability`;
  }
  
  return narrative;
}

module.exports = {
  reconcileToFinalValue,
  analyzeApproachReliability,
  determineReconciliationWeights,
  analyzeValueVariance
};
