/**
 * Data Validation and Quality Assurance Module
 * Ensures data integrity and quality before appraisal calculations
 */

/**
 * Comprehensive data validation
 */
async function validateAppraisalData(subjectProperty, comparables, marketData, adjustments) {
  console.log('✅ Starting comprehensive data validation...');
  
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    qualityScore: 100,
    dataCompleteness: {},
    recommendations: []
  };
  
  // Validate subject property
  const subjectValidation = validateSubjectProperty(subjectProperty);
  mergeValidationResults(validation, subjectValidation);
  
  // Validate comparables
  const comparablesValidation = validateComparables(comparables);
  mergeValidationResults(validation, comparablesValidation);
  
  // Validate market data
  const marketValidation = validateMarketData(marketData);
  mergeValidationResults(validation, marketValidation);
  
  // Validate adjustments
  const adjustmentValidation = validateAdjustments(adjustments, comparables);
  mergeValidationResults(validation, adjustmentValidation);
  
  // Calculate overall quality score
  validation.qualityScore = calculateQualityScore(validation);
  
  // Generate data completeness analysis
  validation.dataCompleteness = analyzeDataCompleteness(subjectProperty, comparables, marketData);
  
  // Generate recommendations
  validation.recommendations = generateRecommendations(validation);
  
  return validation;
}

/**
 * Validate subject property data
 */
function validateSubjectProperty(subjectProperty) {
  const validation = { isValid: true, errors: [], warnings: [], qualityScore: 100 };
  
  // Required fields validation
  const requiredFields = [
    'propertyType',
    'physical.buildingArea.grossBuildingArea',
    'physical.landArea.sf',
    'physical.construction.yearBuilt',
    'location.city',
    'location.state'
  ];
  
  requiredFields.forEach(field => {
    if (!getNestedValue(subjectProperty, field)) {
      validation.errors.push(`Missing required field: ${field}`);
      validation.qualityScore -= 10;
    }
  });
  
  // Physical data validation
  if (subjectProperty.physical) {
    const physical = subjectProperty.physical;
    
    // Building area validation
    if (physical.buildingArea) {
      if (physical.buildingArea.grossBuildingArea <= 0) {
        validation.errors.push('Gross building area must be greater than 0');
      }
      
      if (physical.buildingArea.netRentableArea > physical.buildingArea.grossBuildingArea) {
        validation.errors.push('Net rentable area cannot exceed gross building area');
      }
      
      if (physical.buildingArea.netRentableArea / physical.buildingArea.grossBuildingArea < 0.5) {
        validation.warnings.push('Very low efficiency ratio (NRA/GBA < 50%)');
        validation.qualityScore -= 5;
      }
    }
    
    // Land area validation
    if (physical.landArea) {
      if (physical.landArea.sf <= 0) {
        validation.errors.push('Land area must be greater than 0');
      }
      
      // Building coverage ratio check
      const coverage = physical.buildingArea?.grossBuildingArea / physical.landArea.sf;
      if (coverage > 1.0) {
        validation.warnings.push('Building coverage exceeds land area - check data');
        validation.qualityScore -= 5;
      }
    }
    
    // Construction validation
    if (physical.construction) {
      const currentYear = new Date().getFullYear();
      const yearBuilt = physical.construction.yearBuilt;
      
      if (yearBuilt > currentYear) {
        validation.errors.push('Year built cannot be in the future');
      }
      
      if (yearBuilt < 1800) {
        validation.warnings.push('Very old construction date - verify accuracy');
        validation.qualityScore -= 3;
      }
      
      if (currentYear - yearBuilt > 100) {
        validation.warnings.push('Very old building - consider condition impacts');
        validation.qualityScore -= 5;
      }
    }
  }
  
  // Income data validation
  if (subjectProperty.income) {
    const incomeValidation = validateIncomeData(subjectProperty.income);
    mergeValidationResults(validation, incomeValidation);
  }
  
  // Legal data validation
  if (subjectProperty.legal) {
    if (!subjectProperty.legal.propertyRights) {
      validation.warnings.push('Property rights not specified - assuming fee simple');
      validation.qualityScore -= 2;
    }
    
    if (!subjectProperty.legal.zoning) {
      validation.warnings.push('Zoning information not provided');
      validation.qualityScore -= 3;
    }
  }
  
  if (validation.errors.length > 0) {
    validation.isValid = false;
  }
  
  return validation;
}

/**
 * Validate comparables data
 */
function validateComparables(comparables) {
  const validation = { isValid: true, errors: [], warnings: [], qualityScore: 100 };
  
  if (!comparables || !Array.isArray(comparables)) {
    validation.errors.push('Comparables must be provided as an array');
    return validation;
  }
  
  if (comparables.length < 3) {
    validation.warnings.push('Fewer than 3 comparables may reduce reliability');
    validation.qualityScore -= 15;
  }
  
  if (comparables.length > 6) {
    validation.warnings.push('More than 6 comparables may be excessive');
    validation.qualityScore -= 5;
  }
  
  comparables.forEach((comp, index) => {
    const compValidation = validateSingleComparable(comp, index);
    mergeValidationResults(validation, compValidation);
  });
  
  // Check for similar comparables
  const similarityWarnings = checkComparableSimilarity(comparables);
  validation.warnings.push(...similarityWarnings);
  
  if (validation.errors.length > 0) {
    validation.isValid = false;
  }
  
  return validation;
}

/**
 * Validate single comparable
 */
function validateSingleComparable(comparable, index) {
  const validation = { isValid: true, errors: [], warnings: [], qualityScore: 100 };
  const prefix = `Comparable ${index + 1}:`;
  
  // Required fields
  const requiredFields = ['salePrice', 'buildingSize', 'propertyType'];
  
  requiredFields.forEach(field => {
    if (!comparable[field] && comparable[field] !== 0) {
      validation.errors.push(`${prefix} Missing required field: ${field}`);
      validation.qualityScore -= 10;
    }
  });
  
  // Sale price validation
  if (comparable.salePrice) {
    if (comparable.salePrice <= 0) {
      validation.errors.push(`${prefix} Sale price must be greater than 0`);
    }
    
    if (comparable.salePrice > 100000000) {
      validation.warnings.push(`${prefix} Very high sale price - verify accuracy`);
      validation.qualityScore -= 3;
    }
  }
  
  // Building size validation
  if (comparable.buildingSize) {
    if (comparable.buildingSize <= 0) {
      validation.errors.push(`${prefix} Building size must be greater than 0`);
    }
    
    if (comparable.buildingSize > 1000000) {
      validation.warnings.push(`${prefix} Very large building - verify accuracy`);
      validation.qualityScore -= 2;
    }
  }
  
  // Sale date validation
  if (comparable.saleDate) {
    const saleDate = new Date(comparable.saleDate);
    const now = new Date();
    const monthsOld = (now - saleDate) / (1000 * 60 * 60 * 24 * 30);
    
    if (saleDate > now) {
      validation.errors.push(`${prefix} Sale date cannot be in the future`);
    }
    
    if (monthsOld > 24) {
      validation.warnings.push(`${prefix} Sale is over 2 years old - time adjustment needed`);
      validation.qualityScore -= 10;
    } else if (monthsOld > 12) {
      validation.warnings.push(`${prefix} Sale is over 1 year old - consider time adjustment`);
      validation.qualityScore -= 5;
    }
  } else {
    validation.warnings.push(`${prefix} Sale date not provided`);
    validation.qualityScore -= 8;
  }
  
  // Price per SF validation
  if (comparable.salePrice && comparable.buildingSize) {
    const pricePerSF = comparable.salePrice / comparable.buildingSize;
    
    if (pricePerSF < 10) {
      validation.warnings.push(`${prefix} Very low price per SF ($${pricePerSF.toFixed(2)}) - verify data`);
      validation.qualityScore -= 5;
    }
    
    if (pricePerSF > 1000) {
      validation.warnings.push(`${prefix} Very high price per SF ($${pricePerSF.toFixed(2)}) - verify data`);
      validation.qualityScore -= 5;
    }
  }
  
  return validation;
}

/**
 * Validate market data
 */
function validateMarketData(marketData) {
  const validation = { isValid: true, errors: [], warnings: [], qualityScore: 100 };
  
  if (!marketData) {
    validation.warnings.push('No market data provided - using defaults');
    validation.qualityScore -= 20;
    return validation;
  }
  
  // Cap rates validation
  if (marketData.capRates) {
    Object.entries(marketData.capRates).forEach(([type, rate]) => {
      if (rate < 0.02 || rate > 0.20) {
        validation.warnings.push(`Unusual cap rate for ${type}: ${(rate * 100).toFixed(1)}%`);
        validation.qualityScore -= 3;
      }
    });
  } else {
    validation.warnings.push('No cap rate data provided');
    validation.qualityScore -= 15;
  }
  
  // Expense ratios validation
  if (marketData.expenseRatios) {
    Object.entries(marketData.expenseRatios).forEach(([type, ratio]) => {
      if (ratio < 0.1 || ratio > 0.8) {
        validation.warnings.push(`Unusual expense ratio for ${type}: ${(ratio * 100).toFixed(1)}%`);
        validation.qualityScore -= 3;
      }
    });
  }
  
  return validation;
}

/**
 * Validate adjustments
 */
function validateAdjustments(adjustments, comparables) {
  const validation = { isValid: true, errors: [], warnings: [], qualityScore: 100 };
  
  if (!adjustments || typeof adjustments !== 'object') {
    validation.warnings.push('No adjustments provided - using market-based adjustments');
    validation.qualityScore -= 10;
    return validation;
  }
  
  comparables.forEach((comp, index) => {
    const compAdjustments = adjustments[comp.id] || adjustments[index];
    
    if (compAdjustments) {
      let totalAdjustment = 0;
      
      Object.entries(compAdjustments).forEach(([type, adjustment]) => {
        const adjValue = Math.abs(parseFloat(adjustment) || 0);
        totalAdjustment += adjValue;
        
        // Individual adjustment limits
        if (adjValue > comp.salePrice * 0.3) {
          validation.warnings.push(`Large ${type} adjustment (${(adjValue/comp.salePrice*100).toFixed(1)}%) for comparable ${index + 1}`);
          validation.qualityScore -= 5;
        }
      });
      
      // Total adjustment limits
      if (totalAdjustment > comp.salePrice * 0.5) {
        validation.warnings.push(`Very high total adjustments (${(totalAdjustment/comp.salePrice*100).toFixed(1)}%) for comparable ${index + 1}`);
        validation.qualityScore -= 10;
      }
    }
  });
  
  return validation;
}

/**
 * Validate income data
 */
function validateIncomeData(incomeData) {
  const validation = { isValid: true, errors: [], warnings: [], qualityScore: 100 };
  
  if (incomeData.rentRoll) {
    let totalRent = 0;
    
    incomeData.rentRoll.forEach((unit, index) => {
      if (!unit.currentRent || unit.currentRent < 0) {
        validation.warnings.push(`Unit ${index + 1}: Invalid rent amount`);
        validation.qualityScore -= 3;
      } else {
        totalRent += unit.currentRent;
      }
      
      if (!unit.leaseExpiration) {
        validation.warnings.push(`Unit ${index + 1}: Missing lease expiration`);
        validation.qualityScore -= 2;
      }
    });
    
    if (incomeData.grossIncome && Math.abs(totalRent * 12 - incomeData.grossIncome) > incomeData.grossIncome * 0.1) {
      validation.warnings.push('Gross income does not match rent roll total');
      validation.qualityScore -= 8;
    }
  }
  
  if (incomeData.expenses) {
    const totalExpenses = Object.values(incomeData.expenses).reduce((sum, exp) => sum + (parseFloat(exp) || 0), 0);
    
    if (incomeData.grossIncome) {
      const expenseRatio = totalExpenses / incomeData.grossIncome;
      
      if (expenseRatio > 0.8) {
        validation.warnings.push(`Very high expense ratio: ${(expenseRatio * 100).toFixed(1)}%`);
        validation.qualityScore -= 10;
      }
      
      if (expenseRatio < 0.1) {
        validation.warnings.push(`Very low expense ratio: ${(expenseRatio * 100).toFixed(1)}%`);
        validation.qualityScore -= 5;
      }
    }
  }
  
  return validation;
}

/**
 * Helper functions
 */

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

function mergeValidationResults(target, source) {
  target.errors.push(...source.errors);
  target.warnings.push(...source.warnings);
  if (!source.isValid) target.isValid = false;
  target.qualityScore = Math.min(target.qualityScore, source.qualityScore);
}

function calculateQualityScore(validation) {
  let score = validation.qualityScore;
  
  // Penalty for errors
  score -= validation.errors.length * 15;
  
  // Penalty for warnings
  score -= validation.warnings.length * 3;
  
  return Math.max(0, Math.min(100, score));
}

function analyzeDataCompleteness(subjectProperty, comparables, marketData) {
  const completeness = {
    subjectProperty: 0,
    comparables: 0,
    marketData: 0,
    overall: 0
  };
  
  // Subject property completeness
  const subjectFields = [
    'propertyType', 'physical.buildingArea.grossBuildingArea', 'physical.landArea.sf',
    'physical.construction.yearBuilt', 'location.address', 'location.city', 'location.state',
    'physical.condition', 'legal.zoning', 'legal.propertyRights'
  ];
  
  const subjectComplete = subjectFields.filter(field => getNestedValue(subjectProperty, field)).length;
  completeness.subjectProperty = Math.round((subjectComplete / subjectFields.length) * 100);
  
  // Comparables completeness
  if (comparables && comparables.length > 0) {
    const compFields = ['salePrice', 'buildingSize', 'saleDate', 'propertyType', 'location'];
    const totalPossible = comparables.length * compFields.length;
    const totalComplete = comparables.reduce((sum, comp) => {
      return sum + compFields.filter(field => comp[field]).length;
    }, 0);
    
    completeness.comparables = Math.round((totalComplete / totalPossible) * 100);
  }
  
  // Market data completeness
  const marketFields = ['capRates', 'expenseRatios', 'constructionCosts', 'marketConditions'];
  const marketComplete = marketFields.filter(field => marketData && marketData[field]).length;
  completeness.marketData = Math.round((marketComplete / marketFields.length) * 100);
  
  // Overall completeness
  completeness.overall = Math.round((completeness.subjectProperty + completeness.comparables + completeness.marketData) / 3);
  
  return completeness;
}

function checkComparableSimilarity(comparables) {
  const warnings = [];
  
  // Check for duplicate sales
  const salesMap = new Map();
  comparables.forEach((comp, index) => {
    const key = `${comp.propertyName || comp.address}_${comp.salePrice}_${comp.saleDate}`;
    if (salesMap.has(key)) {
      warnings.push(`Comparable ${index + 1} may be a duplicate of comparable ${salesMap.get(key) + 1}`);
    } else {
      salesMap.set(key, index);
    }
  });
  
  return warnings;
}

function generateRecommendations(validation) {
  const recommendations = [];
  
  if (validation.qualityScore < 60) {
    recommendations.push('Consider obtaining additional data to improve reliability');
  }
  
  if (validation.errors.length > 0) {
    recommendations.push('Resolve all data errors before proceeding with valuation');
  }
  
  if (validation.warnings.filter(w => w.includes('adjustment')).length > 0) {
    recommendations.push('Review large adjustments for reasonableness and market support');
  }
  
  if (validation.warnings.filter(w => w.includes('old')).length > 0) {
    recommendations.push('Consider time adjustments for older sales data');
  }
  
  return recommendations;
}

module.exports = {
  validateAppraisalData,
  validateSubjectProperty,
  validateComparables,
  validateMarketData,
  validateAdjustments
};
