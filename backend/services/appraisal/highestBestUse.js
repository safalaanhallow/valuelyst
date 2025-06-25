/**
 * Highest and Best Use Analysis Module
 * Determines the highest and best use of a property as vacant and as improved
 */

/**
 * Conduct comprehensive highest and best use analysis
 */
async function analyzeHighestAndBestUse(subjectProperty, marketData) {
  console.log('🎯 Starting Highest and Best Use Analysis...');
  
  // Analyze as vacant land
  const asVacant = await analyzeAsVacant(subjectProperty, marketData);
  
  // Analyze as improved
  const asImproved = await analyzeAsImproved(subjectProperty, marketData);
  
  // Final conclusion
  const conclusion = determineHBUConclusion(asVacant, asImproved, subjectProperty);
  
  return {
    asVacant,
    asImproved,
    conclusion,
    narrative: generateHBUNarrative(asVacant, asImproved, conclusion),
    analysisDate: new Date().toISOString()
  };
}

/**
 * Analyze highest and best use as vacant land
 */
async function analyzeAsVacant(subjectProperty, marketData) {
  console.log('🏞️ Analyzing highest and best use as vacant...');
  
  const analysis = {
    legallyPermissible: [],
    physicallyPossible: [],
    financiallyFeasible: [],
    conclusion: null,
    supportingAnalysis: {}
  };
  
  // Step 1: Legally Permissible Uses
  analysis.legallyPermissible = determineLegallyPermissibleUses(subjectProperty);
  
  // Step 2: Physically Possible Uses
  analysis.physicallyPossible = determinePhysicallyPossibleUses(
    analysis.legallyPermissible, 
    subjectProperty
  );
  
  // Step 3: Financially Feasible Uses
  analysis.financiallyFeasible = await determineFinanciallyFeasibleUses(
    analysis.physicallyPossible,
    subjectProperty,
    marketData
  );
  
  // Step 4: Maximally Productive Use
  analysis.conclusion = determineMaximallyProductiveUse(
    analysis.financiallyFeasible,
    subjectProperty,
    marketData
  );
  
  analysis.supportingAnalysis = {
    zoning: subjectProperty.legal?.zoning || 'Unknown',
    landArea: subjectProperty.physical?.landArea?.sf || 0,
    frontage: subjectProperty.physical?.frontage || 'Unknown',
    utilities: subjectProperty.physical?.utilities || 'Available',
    marketDemand: assessMarketDemand(analysis.conclusion?.use, marketData)
  };
  
  return analysis;
}

/**
 * Analyze highest and best use as improved
 */
async function analyzeAsImproved(subjectProperty, marketData) {
  console.log('🏢 Analyzing highest and best use as improved...');
  
  const currentUse = subjectProperty.propertyType;
  const buildingAge = new Date().getFullYear() - (subjectProperty.physical?.construction?.yearBuilt || 2000);
  
  const analysis = {
    continueCurrentUse: null,
    modifyCurrentUse: null,
    demolishAndRedevelop: null,
    conclusion: null,
    contributoryValue: 0
  };
  
  // Option 1: Continue current use
  analysis.continueCurrentUse = await evaluateContinueCurrentUse(subjectProperty, marketData);
  
  // Option 2: Modify current use
  analysis.modifyCurrentUse = await evaluateModifyCurrentUse(subjectProperty, marketData);
  
  // Option 3: Demolish and redevelop
  analysis.demolishAndRedevelop = await evaluateDemolishAndRedevelop(subjectProperty, marketData);
  
  // Determine best option
  const options = [
    { type: 'continue', analysis: analysis.continueCurrentUse },
    { type: 'modify', analysis: analysis.modifyCurrentUse },
    { type: 'demolish', analysis: analysis.demolishAndRedevelop }
  ];
  
  const bestOption = options.reduce((best, current) => {
    return (current.analysis?.netValue || 0) > (best.analysis?.netValue || 0) ? current : best;
  });
  
  analysis.conclusion = bestOption;
  analysis.contributoryValue = bestOption.analysis?.netValue || 0;
  
  return analysis;
}

/**
 * Determine legally permissible uses
 */
function determineLegallyPermissibleUses(subjectProperty) {
  const zoning = subjectProperty.legal?.zoning?.toLowerCase() || '';
  const uses = [];
  
  // Common zoning categories
  if (zoning.includes('commercial') || zoning.includes('c-') || zoning.includes('retail')) {
    uses.push('Office', 'Retail', 'Restaurant', 'Services', 'Mixed Use');
  }
  
  if (zoning.includes('industrial') || zoning.includes('i-') || zoning.includes('manufacturing')) {
    uses.push('Industrial', 'Warehouse', 'Manufacturing', 'Distribution');
  }
  
  if (zoning.includes('office') || zoning.includes('professional')) {
    uses.push('Office', 'Medical Office', 'Professional Services');
  }
  
  if (zoning.includes('mixed') || zoning.includes('mu-')) {
    uses.push('Mixed Use', 'Office', 'Retail', 'Residential');
  }
  
  if (zoning.includes('residential') || zoning.includes('r-')) {
    uses.push('Multifamily', 'Residential');
  }
  
  // Default fallback
  if (uses.length === 0) {
    uses.push(subjectProperty.propertyType || 'Office');
  }
  
  return uses;
}

/**
 * Determine physically possible uses
 */
function determinePhysicallyPossibleUses(legalUses, subjectProperty) {
  const physical = subjectProperty.physical;
  const landArea = physical?.landArea?.sf || 0;
  const frontage = physical?.frontage || 100;
  const uses = [];
  
  legalUses.forEach(use => {
    let isPossible = true;
    const requirements = getPhysicalRequirements(use);
    
    // Check minimum land area
    if (landArea < requirements.minLandArea) {
      isPossible = false;
    }
    
    // Check frontage requirements
    if (frontage < requirements.minFrontage) {
      isPossible = false;
    }
    
    // Check access requirements
    if (requirements.requiresHighwayAccess && !physical?.accessToHighway) {
      // For industrial uses, reduce viability but don't eliminate
      if (use === 'Industrial' || use === 'Warehouse') {
        isPossible = true; // Allow but note limitation
      }
    }
    
    if (isPossible) {
      uses.push({
        use,
        requirements,
        suitability: calculatePhysicalSuitability(use, subjectProperty)
      });
    }
  });
  
  return uses;
}

/**
 * Determine financially feasible uses
 */
async function determineFinanciallyFeasibleUses(physicalUses, subjectProperty, marketData) {
  const feasibleUses = [];
  
  for (const physicalUse of physicalUses) {
    const feasibility = await analyzeFeasibility(physicalUse.use, subjectProperty, marketData);
    
    if (feasibility.isFeasible) {
      feasibleUses.push({
        use: physicalUse.use,
        suitability: physicalUse.suitability,
        feasibility,
        estimatedValue: feasibility.estimatedValue,
        roi: feasibility.roi
      });
    }
  }
  
  return feasibleUses.sort((a, b) => b.estimatedValue - a.estimatedValue);
}

/**
 * Determine maximally productive use
 */
function determineMaximallyProductiveUse(feasibleUses, subjectProperty, marketData) {
  if (feasibleUses.length === 0) {
    return {
      use: subjectProperty.propertyType || 'Office',
      estimatedValue: 0,
      reasoning: 'No financially feasible alternatives identified'
    };
  }
  
  // Consider both value and market stability
  const bestUse = feasibleUses.reduce((best, current) => {
    const currentScore = (current.estimatedValue * 0.7) + (current.feasibility.marketStability * current.estimatedValue * 0.3);
    const bestScore = (best.estimatedValue * 0.7) + (best.feasibility.marketStability * best.estimatedValue * 0.3);
    
    return currentScore > bestScore ? current : best;
  });
  
  return {
    use: bestUse.use,
    estimatedValue: bestUse.estimatedValue,
    roi: bestUse.roi,
    marketStability: bestUse.feasibility.marketStability,
    reasoning: generateMaxProductivityReasoning(bestUse, feasibleUses)
  };
}

/**
 * Evaluate continuing current use
 */
async function evaluateContinueCurrentUse(subjectProperty, marketData) {
  const currentUse = subjectProperty.propertyType;
  const building = subjectProperty.physical;
  const buildingAge = new Date().getFullYear() - (building?.construction?.yearBuilt || 2000);
  
  // Estimate current income potential
  const currentIncome = estimateCurrentIncome(subjectProperty, marketData);
  
  // Estimate required capital improvements
  const capitalImprovements = estimateCapitalImprovements(building, buildingAge);
  
  // Calculate net value
  const grossValue = currentIncome.annualIncome / (marketData?.capRates?.[currentUse] || 0.08);
  const netValue = grossValue - capitalImprovements;
  
  return {
    grossValue,
    capitalImprovements,
    netValue,
    income: currentIncome,
    suitability: assessCurrentUseSuitability(subjectProperty, marketData),
    marketDemand: assessMarketDemand(currentUse, marketData)
  };
}

/**
 * Evaluate modifying current use
 */
async function evaluateModifyCurrentUse(subjectProperty, marketData) {
  const currentUse = subjectProperty.propertyType;
  const modifications = identifyPossibleModifications(subjectProperty);
  
  let bestModification = null;
  let bestValue = 0;
  
  for (const modification of modifications) {
    const modCost = estimateModificationCost(modification, subjectProperty);
    const modIncome = estimateModifiedIncome(modification, subjectProperty, marketData);
    const modValue = modIncome.annualIncome / (marketData?.capRates?.[modification.targetUse] || 0.08);
    const netValue = modValue - modCost.totalCost;
    
    if (netValue > bestValue) {
      bestValue = netValue;
      bestModification = {
        ...modification,
        cost: modCost,
        income: modIncome,
        grossValue: modValue,
        netValue
      };
    }
  }
  
  return bestModification || {
    netValue: 0,
    reasoning: 'No beneficial modifications identified'
  };
}

/**
 * Evaluate demolish and redevelop option
 */
async function evaluateDemolishAndRedevelop(subjectProperty, marketData) {
  const demolitionCost = estimateDemolitionCost(subjectProperty);
  const landValue = estimateLandValue(subjectProperty, marketData);
  
  // Get HBU as vacant
  const hbuVacant = await analyzeAsVacant(subjectProperty, marketData);
  const developmentValue = hbuVacant.conclusion?.estimatedValue || 0;
  
  const developmentCost = estimateDevelopmentCost(hbuVacant.conclusion?.use, subjectProperty, marketData);
  const totalCost = demolitionCost + developmentCost;
  const netValue = developmentValue - totalCost;
  
  return {
    landValue,
    demolitionCost,
    developmentCost,
    developmentValue,
    totalCost,
    netValue,
    newUse: hbuVacant.conclusion?.use,
    feasible: netValue > 0
  };
}

/**
 * Helper functions for HBU analysis
 */

function getPhysicalRequirements(use) {
  const requirements = {
    'Office': { minLandArea: 5000, minFrontage: 50, requiresHighwayAccess: false },
    'Retail': { minLandArea: 3000, minFrontage: 100, requiresHighwayAccess: false },
    'Industrial': { minLandArea: 20000, minFrontage: 150, requiresHighwayAccess: true },
    'Warehouse': { minLandArea: 15000, minFrontage: 100, requiresHighwayAccess: true },
    'Multifamily': { minLandArea: 8000, minFrontage: 80, requiresHighwayAccess: false },
    'Mixed Use': { minLandArea: 6000, minFrontage: 75, requiresHighwayAccess: false }
  };
  
  return requirements[use] || { minLandArea: 5000, minFrontage: 50, requiresHighwayAccess: false };
}

function calculatePhysicalSuitability(use, subjectProperty) {
  let suitability = 1.0;
  const physical = subjectProperty.physical;
  
  // Location factors
  if (use === 'Retail' && physical?.trafficCount < 10000) {
    suitability *= 0.8;
  }
  
  if (use === 'Industrial' && !physical?.railAccess) {
    // For industrial uses, reduce viability but don't eliminate
    if (use === 'Industrial' || use === 'Warehouse') {
      suitability *= 0.9;
    }
  }
  
  // Site factors
  const landArea = physical?.landArea?.sf || 0;
  const requirements = getPhysicalRequirements(use);
  
  if (landArea < requirements.minLandArea * 1.5) {
    suitability *= 0.9;
  }
  
  return Math.max(0.5, suitability);
}

async function analyzeFeasibility(use, subjectProperty, marketData) {
  const landValue = estimateLandValue(subjectProperty, marketData);
  const developmentCost = estimateDevelopmentCost(use, subjectProperty, marketData);
  const totalCost = landValue + developmentCost;
  
  const projectedIncome = estimateProjectedIncome(use, subjectProperty, marketData);
  const capRate = marketData?.capRates?.[use] || 0.08;
  const estimatedValue = projectedIncome / capRate;
  
  const roi = (estimatedValue - totalCost) / totalCost;
  const isFeasible = roi > 0.15; // Minimum 15% return
  
  return {
    isFeasible,
    estimatedValue,
    totalCost,
    roi,
    marketStability: assessMarketStability(use, marketData)
  };
}

function estimateLandValue(subjectProperty, marketData) {
  const landArea = subjectProperty.physical?.landArea?.sf || 0;
  const zoning = subjectProperty.legal?.zoning || '';
  
  // Default land values by zoning (per SF)
  const landValues = {
    'commercial': 25,
    'industrial': 8,
    'office': 30,
    'mixed': 35,
    'residential': 15
  };
  
  let landValuePSF = 20; // Default
  
  for (const [zone, value] of Object.entries(landValues)) {
    if (zoning.toLowerCase().includes(zone)) {
      landValuePSF = value;
      break;
    }
  }
  
  // Apply market adjustments
  if (marketData?.landValueMultiplier) {
    landValuePSF *= marketData.landValueMultiplier;
  }
  
  return landArea * landValuePSF;
}

function estimateDevelopmentCost(use, subjectProperty, marketData) {
  const landArea = subjectProperty.physical?.landArea?.sf || 0;
  const buildableArea = landArea * 0.6; // Assume 60% coverage
  
  const costPerSF = {
    'Office': 150,
    'Retail': 120,
    'Industrial': 80,
    'Warehouse': 60,
    'Multifamily': 130,
    'Mixed Use': 140
  };
  
  const baseCost = (costPerSF[use] || 120) * buildableArea;
  
  // Add soft costs and contingency
  return baseCost * 1.35; // 35% for soft costs, contingency, profit
}

function estimateProjectedIncome(use, subjectProperty, marketData) {
  const landArea = subjectProperty.physical?.landArea?.sf || 0;
  const buildableArea = landArea * 0.6;
  
  const rentPSF = {
    'Office': 25,
    'Retail': 20,
    'Industrial': 8,
    'Warehouse': 6,
    'Multifamily': 1.2, // Per SF per month
    'Mixed Use': 22
  };
  
  const annualRent = (rentPSF[use] || 20) * buildableArea * 12;
  const vacancy = 0.05; // 5% vacancy
  const expenses = annualRent * 0.35; // 35% expenses
  
  return annualRent * (1 - vacancy) - expenses;
}

function assessMarketDemand(use, marketData) {
  if (!marketData?.demand) return 'moderate';
  
  return marketData.demand[use] || 'moderate';
}

function assessMarketStability(use, marketData) {
  const stability = {
    'Office': 0.8,
    'Retail': 0.6,
    'Industrial': 0.9,
    'Warehouse': 0.85,
    'Multifamily': 0.9,
    'Mixed Use': 0.7
  };
  
  return stability[use] || 0.7;
}

function determineHBUConclusion(asVacant, asImproved, subjectProperty) {
  const vacantValue = asVacant.conclusion?.estimatedValue || 0;
  const improvedValue = asImproved.contributoryValue || 0;
  
  if (vacantValue > improvedValue * 1.2) {
    return {
      conclusion: 'Redevelopment to highest and best use as vacant',
      recommendedUse: asVacant.conclusion?.use,
      reasoning: 'Land value exceeds improved value by significant margin',
      contributoryValue: vacantValue
    };
  } else {
    return {
      conclusion: 'Continue current use with modifications as appropriate',
      recommendedUse: asImproved.conclusion?.type === 'modify' ? 
        asImproved.conclusion.analysis?.targetUse : subjectProperty.propertyType,
      reasoning: 'Current use maximizes property value',
      contributoryValue: improvedValue
    };
  }
}

function generateHBUNarrative(asVacant, asImproved, conclusion) {
  return {
    summary: conclusion.conclusion,
    
    asVacantAnalysis: `Analysis as vacant land supports ${asVacant.conclusion?.use || 'current zoning'} use with estimated value of $${(asVacant.conclusion?.estimatedValue || 0).toLocaleString()}.`,
    
    asImprovedAnalysis: `Analysis as improved supports ${asImproved.conclusion?.type || 'continuing current use'} with contributory value of $${(asImproved.contributoryValue || 0).toLocaleString()}.`,
    
    conclusion: conclusion.reasoning,
    
    recommendation: `The highest and best use is ${conclusion.recommendedUse} with an estimated contributory value of $${conclusion.contributoryValue.toLocaleString()}.`
  };
}

/**
 * Generate reasoning for maximally productive use selection
 */
function generateMaxProductivityReasoning(bestUse, feasibleUses) {
  const reasons = [];
  
  reasons.push(`Selected ${bestUse.use} as the maximally productive use based on the following analysis:`);
  
  if (bestUse.estimatedValue) {
    reasons.push(`- Estimated market value: $${bestUse.estimatedValue.toLocaleString()}`);
  }
  
  if (bestUse.roi) {
    reasons.push(`- Expected return on investment: ${(bestUse.roi * 100).toFixed(1)}%`);
  }
  
  if (bestUse.feasibility?.marketStability > 0.7) {
    reasons.push(`- High market stability for this use (${(bestUse.feasibility.marketStability * 100).toFixed(0)}%)`);
  } else if (bestUse.feasibility?.marketStability > 0.5) {
    reasons.push(`- Moderate market stability for this use (${(bestUse.feasibility.marketStability * 100).toFixed(0)}%)`);
  }
  
  // Compare to other uses
  const otherUses = feasibleUses.filter(u => u.use !== bestUse.use);
  if (otherUses.length > 0) {
    const avgOtherValue = otherUses.reduce((sum, use) => sum + (use.estimatedValue || 0), 0) / otherUses.length;
    if (bestUse.estimatedValue > avgOtherValue * 1.1) {
      reasons.push(`- Significantly outperforms other feasible uses by ${(((bestUse.estimatedValue / avgOtherValue) - 1) * 100).toFixed(0)}%`);
    }
  }
  
  return reasons.join(' ');
}

/**
 * Estimate current income potential
 */
function estimateCurrentIncome(subjectProperty, marketData) {
  const building = subjectProperty.physical;
  const income = subjectProperty.income;
  
  // Use actual income if available
  if (income?.netOperatingIncome) {
    return {
      annualIncome: income.netOperatingIncome,
      source: 'actual',
      confidence: 0.9
    };
  }
  
  // Estimate based on building size and market rates
  const rentableArea = building?.buildingArea?.netRentableArea || building?.buildingArea?.grossBuildingArea || 0;
  const propertyType = subjectProperty.propertyType?.toLowerCase() || 'office';
  
  // Default market rent rates per SF
  const marketRents = {
    'office': 25,
    'retail': 20,
    'warehouse': 8,
    'industrial': 10,
    'flex space': 15,
    'mixed use': 22
  };
  
  const baseRent = marketRents[propertyType] || 20;
  const grossIncome = rentableArea * baseRent * 12;
  const vacancy = 0.05; // 5% default vacancy
  const expenses = grossIncome * 0.35; // 35% expense ratio
  const netIncome = grossIncome * (1 - vacancy) - expenses;
  
  return {
    annualIncome: netIncome,
    source: 'estimated',
    confidence: 0.6,
    grossIncome,
    vacancy: vacancy * 100,
    expenses
  };
}

/**
 * Estimate capital improvements needed
 */
function estimateCapitalImprovements(building, buildingAge) {
  let improvements = 0;
  
  // Age-based improvements
  if (buildingAge > 20) {
    improvements += 15; // $15 per SF for major renovations
  } else if (buildingAge > 10) {
    improvements += 8; // $8 per SF for moderate updates
  } else if (buildingAge > 5) {
    improvements += 3; // $3 per SF for minor updates
  }
  
  // Condition-based improvements
  const condition = building?.construction?.condition?.toLowerCase() || 'average';
  switch (condition) {
    case 'poor':
      improvements += 25;
      break;
    case 'fair':
      improvements += 12;
      break;
    case 'average':
      improvements += 5;
      break;
    case 'good':
      improvements += 2;
      break;
    case 'excellent':
      improvements += 0;
      break;
  }
  
  const buildingArea = building?.buildingArea?.grossBuildingArea || 0;
  return buildingArea * improvements;
}

/**
 * Assess current use suitability
 */
function assessCurrentUseSuitability(subjectProperty, marketData) {
  const building = subjectProperty.physical;
  const location = subjectProperty.location;
  const currentUse = subjectProperty.propertyType;
  
  let suitability = 0.7; // Base suitability
  
  // Building age factor
  const buildingAge = new Date().getFullYear() - (building?.construction?.yearBuilt || 2000);
  if (buildingAge < 10) {
    suitability += 0.1;
  } else if (buildingAge > 30) {
    suitability -= 0.2;
  }
  
  // Condition factor
  const condition = building?.construction?.condition?.toLowerCase() || 'average';
  switch (condition) {
    case 'excellent':
      suitability += 0.15;
      break;
    case 'good':
      suitability += 0.1;
      break;
    case 'average':
      // no change
      break;
    case 'fair':
      suitability -= 0.1;
      break;
    case 'poor':
      suitability -= 0.2;
      break;
  }
  
  // Location factor
  const neighborhood = location?.neighborhood?.toLowerCase() || 'b';
  if (neighborhood.includes('a')) {
    suitability += 0.1;
  } else if (neighborhood.includes('c') || neighborhood.includes('d')) {
    suitability -= 0.1;
  }
  
  return Math.max(0.1, Math.min(1.0, suitability));
}

/**
 * Identify possible modifications to current use
 */
function identifyPossibleModifications(subjectProperty) {
  const building = subjectProperty.physical;
  const currentUse = subjectProperty.propertyType?.toLowerCase() || '';
  const modifications = [];
  
  // Common modifications based on property type
  if (currentUse.includes('office')) {
    modifications.push({
      type: 'Mixed Use Conversion',
      description: 'Convert part of office space to retail or restaurant use',
      cost: building?.buildingArea?.grossBuildingArea * 25 || 0,
      incomeIncrease: 0.15,
      feasibility: 0.7
    });
    
    modifications.push({
      type: 'Medical Office Conversion',
      description: 'Convert to medical office with specialized HVAC and layouts',
      cost: building?.buildingArea?.grossBuildingArea * 35 || 0,
      incomeIncrease: 0.25,
      feasibility: 0.6
    });
  }
  
  if (currentUse.includes('retail')) {
    modifications.push({
      type: 'Restaurant Conversion',
      description: 'Add kitchen facilities and modify for restaurant use',
      cost: building?.buildingArea?.grossBuildingArea * 45 || 0,
      incomeIncrease: 0.3,
      feasibility: 0.5
    });
  }
  
  if (currentUse.includes('warehouse') || currentUse.includes('industrial')) {
    modifications.push({
      type: 'Flex Space Conversion',
      description: 'Add office areas and improve finishes for flex space use',
      cost: building?.buildingArea?.grossBuildingArea * 20 || 0,
      incomeIncrease: 0.4,
      feasibility: 0.8
    });
  }
  
  // General improvements
  modifications.push({
    type: 'Energy Efficiency Upgrades',
    description: 'HVAC, lighting, and insulation improvements',
    cost: building?.buildingArea?.grossBuildingArea * 15 || 0,
    incomeIncrease: 0.08,
    feasibility: 0.9
  });
  
  modifications.push({
    type: 'Technology Infrastructure',
    description: 'Enhanced electrical, telecommunications, and smart building systems',
    cost: building?.buildingArea?.grossBuildingArea * 12 || 0,
    incomeIncrease: 0.06,
    feasibility: 0.85
  });
  
  return modifications;
}

/**
 * Estimate cost for a specific modification
 */
function estimateModificationCost(modification, subjectProperty) {
  const building = subjectProperty.physical;
  const buildingArea = building?.buildingArea?.grossBuildingArea || 0;
  
  // Base cost from modification object
  let cost = modification.cost || 0;
  
  // Adjust for building condition
  const condition = building?.construction?.condition?.toLowerCase() || 'average';
  let conditionMultiplier = 1.0;
  
  switch (condition) {
    case 'poor':
      conditionMultiplier = 1.4; // 40% more expensive
      break;
    case 'fair':
      conditionMultiplier = 1.2; // 20% more expensive
      break;
    case 'average':
      conditionMultiplier = 1.0; // base cost
      break;
    case 'good':
      conditionMultiplier = 0.9; // 10% less expensive
      break;
    case 'excellent':
      conditionMultiplier = 0.8; // 20% less expensive
      break;
  }
  
  // Adjust for building age
  const buildingAge = new Date().getFullYear() - (building?.construction?.yearBuilt || 2000);
  let ageMultiplier = 1.0;
  
  if (buildingAge > 30) {
    ageMultiplier = 1.3; // Older buildings more expensive to modify
  } else if (buildingAge > 20) {
    ageMultiplier = 1.15;
  } else if (buildingAge > 10) {
    ageMultiplier = 1.05;
  }
  
  // Calculate total cost
  const totalCost = cost * conditionMultiplier * ageMultiplier;
  
  return {
    baseCost: cost,
    conditionMultiplier,
    ageMultiplier,
    totalCost,
    costPerSF: buildingArea > 0 ? totalCost / buildingArea : 0
  };
}

/**
 * Estimate income after modification
 */
function estimateModifiedIncome(modification, subjectProperty, marketData) {
  const currentIncome = estimateCurrentIncome(subjectProperty, marketData);
  const incomeIncrease = modification.incomeIncrease || 0;
  
  // Calculate new income based on percentage increase
  const newAnnualIncome = currentIncome.annualIncome * (1 + incomeIncrease);
  
  return {
    currentIncome: currentIncome.annualIncome,
    incomeIncrease: incomeIncrease * 100, // as percentage
    annualIncome: newAnnualIncome,
    source: 'estimated_modified',
    confidence: currentIncome.confidence * 0.8, // Lower confidence for modified income
    modification: modification.type
  };
}

/**
 * Estimate demolition cost
 */
function estimateDemolitionCost(subjectProperty) {
  const building = subjectProperty.physical;
  const buildingArea = building?.buildingArea?.grossBuildingArea || 0;
  const stories = building?.stories || 1;
  const constructionType = building?.construction?.constructionType?.toLowerCase() || 'wood_frame';
  
  // Base demolition cost per SF
  let baseCostPerSF = 8; // Default $8/SF
  
  // Adjust for construction type
  switch (constructionType) {
    case 'wood_frame':
      baseCostPerSF = 6;
      break;
    case 'steel_frame':
      baseCostPerSF = 10;
      break;
    case 'concrete':
    case 'masonry':
      baseCostPerSF = 12;
      break;
    case 'reinforced_concrete':
      baseCostPerSF = 15;
      break;
  }
  
  // Story multiplier
  const storyMultiplier = 1 + (stories - 1) * 0.15; // 15% more per additional story
  
  // Total demolition cost
  const totalCost = buildingArea * baseCostPerSF * storyMultiplier;
  
  // Add environmental and permit costs (typically 20-30% of demolition)
  const environmentalCosts = totalCost * 0.25;
  
  return {
    baseCost: buildingArea * baseCostPerSF,
    storyMultiplier,
    environmentalCosts,
    totalCost: totalCost + environmentalCosts,
    costPerSF: (totalCost + environmentalCosts) / buildingArea
  };
}

module.exports = {
  analyzeHighestAndBestUse,
  analyzeAsVacant,
  analyzeAsImproved,
  determineLegallyPermissibleUses,
  determinePhysicallyPossibleUses
};
