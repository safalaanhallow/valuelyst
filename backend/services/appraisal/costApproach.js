/**
 * Cost Approach Implementation
 * Land Value + Replacement Cost - Depreciation
 */

/**
 * Calculate Cost Approach value
 */
async function calculateCostApproach(subjectProperty, marketData) {
  console.log('🏗️ Starting Cost Approach Analysis...');
  
  // Step 1: Land Value
  const landValue = await calculateLandValue(subjectProperty, marketData);
  
  // Step 2: Replacement Cost New
  const replacementCost = await calculateReplacementCost(subjectProperty, marketData);
  
  // Step 3: Depreciation Analysis
  const depreciation = await calculateDepreciation(subjectProperty, marketData);
  
  // Step 4: Value Indication
  const valueIndication = landValue.indication + replacementCost.total - depreciation.total;
  
  // Step 5: Assess applicability
  const applicability = assessCostApproachApplicability(subjectProperty);
  
  return {
    approach: 'Cost',
    landValue,
    replacementCost,
    depreciation,
    valueIndication: Math.round(valueIndication),
    applicability,
    confidence: calculateCostConfidence(subjectProperty, applicability),
    narrative: generateCostNarrative(landValue, replacementCost, depreciation, valueIndication)
  };
}

/**
 * Calculate land value using comparable land sales or extraction method
 */
async function calculateLandValue(subjectProperty, marketData) {
  const landArea = subjectProperty.physical.landArea.sf;
  const zoning = subjectProperty.legal.zoning;
  
  // Method 1: Comparable land sales (preferred)
  if (marketData.landSales && marketData.landSales.length > 0) {
    const compatibleSales = marketData.landSales.filter(sale => 
      sale.zoning === zoning && 
      Math.abs(sale.size - landArea) / landArea < 2.0 // Within 200% size difference
    );
    
    if (compatibleSales.length >= 2) {
      const avgPricePSF = compatibleSales.reduce((sum, sale) => 
        sum + sale.pricePerSF, 0) / compatibleSales.length;
      
      return {
        method: 'Comparable Land Sales',
        pricePerSF: avgPricePSF,
        indication: landArea * avgPricePSF,
        comparables: compatibleSales,
        confidence: 'high'
      };
    }
  }
  
  // Method 2: Extraction from improved sales
  if (marketData.improvedSales && marketData.improvedSales.length > 0) {
    const landValuePSF = extractLandValueFromImprovedSales(marketData.improvedSales, marketData);
    
    return {
      method: 'Extraction from Improved Sales',
      pricePerSF: landValuePSF,
      indication: landArea * landValuePSF,
      confidence: 'medium'
    };
  }
  
  // Method 3: Market-based estimate by zoning
  const marketEstimate = getMarketLandValue(zoning, subjectProperty.location, marketData);
  
  return {
    method: 'Market Estimate',
    pricePerSF: marketEstimate,
    indication: landArea * marketEstimate,
    confidence: 'low'
  };
}

/**
 * Calculate replacement cost new
 */
async function calculateReplacementCost(subjectProperty, marketData) {
  const building = subjectProperty.physical;
  const totalSF = building.buildingArea.grossBuildingArea;
  const propertyType = subjectProperty.propertyType;
  
  // Base construction cost per SF
  const baseConstructionCost = getConstructionCostPSF(propertyType, building, marketData);
  
  // Quality adjustments
  const qualityMultiplier = getQualityMultiplier(building.construction);
  
  // Size adjustments (economies of scale)
  const sizeMultiplier = getSizeMultiplier(totalSF);
  
  // Regional cost multiplier
  const locationMultiplier = getLocationCostMultiplier(subjectProperty.location, marketData);
  
  // Calculate total replacement cost
  const adjustedCostPSF = baseConstructionCost * qualityMultiplier * sizeMultiplier * locationMultiplier;
  const buildingCost = totalSF * adjustedCostPSF;
  
  // Site improvements
  const siteImprovements = calculateSiteImprovements(subjectProperty, marketData);
  
  // Soft costs (architectural, engineering, permits, etc.)
  const softCosts = (buildingCost + siteImprovements.totalCost) * 0.15; // 15% typical
  
  // Developer profit and overhead
  const developerProfit = (buildingCost + siteImprovements.totalCost + softCosts) * 0.20; // 20% typical
  
  const totalReplacementCost = buildingCost + siteImprovements.totalCost + softCosts + developerProfit;
  
  return {
    building: {
      costPerSF: adjustedCostPSF,
      totalCost: buildingCost,
      multipliers: {
        quality: qualityMultiplier,
        size: sizeMultiplier,
        location: locationMultiplier
      }
    },
    siteImprovements,
    softCosts,
    developerProfit,
    total: totalReplacementCost
  };
}

/**
 * Calculate all forms of depreciation
 */
async function calculateDepreciation(subjectProperty, marketData) {
  const building = subjectProperty.physical;
  const replacementCostNew = await calculateReplacementCost(subjectProperty, marketData);
  
  // Physical Deterioration
  const physicalDeterioration = calculatePhysicalDeterioration(building, replacementCostNew.building.totalCost);
  
  // Functional Obsolescence
  const functionalObsolescence = calculateFunctionalObsolescence(building, marketData);
  
  // External Obsolescence
  const externalObsolescence = calculateExternalObsolescence(subjectProperty, marketData);
  
  const totalDepreciation = physicalDeterioration.total + functionalObsolescence.total + externalObsolescence.total;
  
  return {
    physical: physicalDeterioration,
    functional: functionalObsolescence,
    external: externalObsolescence,
    total: totalDepreciation,
    percentOfRCN: totalDepreciation / replacementCostNew.building.totalCost
  };
}

/**
 * Calculate physical deterioration
 */
function calculatePhysicalDeterioration(building, replacementCost) {
  const currentYear = new Date().getFullYear();
  const actualAge = currentYear - building.construction.yearBuilt;
  const effectiveAge = calculateEffectiveAge(building, actualAge);
  
  // Economic life by property type
  const economicLife = getEconomicLife(building.constructionType, building.propertyType);
  
  // Curable deterioration (items that should be fixed)
  const curableItems = identifyCurableItems(building);
  const curableCost = curableItems.totalCost;
  
  // Incurable deterioration - short-lived items
  const shortLivedDepreciation = calculateShortLivedDepreciation(building, replacementCost);
  
  // Incurable deterioration - long-lived items (structure)
  const longLivedDepreciation = calculateLongLivedDepreciation(effectiveAge.effectiveAge, economicLife, replacementCost);
  
  return {
    curable: curableCost,
    incurableShortLived: shortLivedDepreciation,
    incurableLongLived: longLivedDepreciation,
    total: curableCost + shortLivedDepreciation.totalDepreciation + longLivedDepreciation.depreciation,
    effectiveAge: effectiveAge.effectiveAge,
    economicLife
  };
}

/**
 * Calculate functional obsolescence
 */
function calculateFunctionalObsolescence(building, marketData) {
  let curableObsolescence = 0;
  let incurableObsolescence = 0;
  const issues = [];
  
  // Curable functional obsolescence
  if (building.ceilingHeight < 9 && building.propertyType === 'Office') {
    curableObsolescence += 5000; // Cost to raise ceilings
    issues.push('Low ceiling height');
  }
  
  if (!building.hvacType || building.hvacType === 'window_units') {
    curableObsolescence += building.buildingArea.grossBuildingArea * 8; // $8/SF for HVAC
    issues.push('Inadequate HVAC system');
  }
  
  // Incurable functional obsolescence
  if (building.floorPlan === 'cellular' && marketData.preferences?.openFloorPlan) {
    const rentLoss = building.buildingArea.netRentableArea * 2; // $2/SF annual rent loss
    const capRate = 0.07; // 7% cap rate
    incurableObsolescence += rentLoss / capRate;
    issues.push('Outdated floor plan');
  }
  
  return {
    curable: curableObsolescence,
    incurable: incurableObsolescence,
    total: curableObsolescence + incurableObsolescence,
    issues
  };
}

/**
 * Calculate external obsolescence
 */
function calculateExternalObsolescence(subjectProperty, marketData) {
  let obsolescence = 0;
  const factors = [];
  
  // Market conditions
  if (marketData.marketConditions?.declining) {
    obsolescence += subjectProperty.physical.buildingArea.grossBuildingArea * 5; // $5/SF
    factors.push('Declining market conditions');
  }
  
  // Location factors
  const location = subjectProperty.location;
  if (location.neighborhood === 'D' || location.neighborhood === 'declining') {
    obsolescence += subjectProperty.physical.buildingArea.grossBuildingArea * 8; // $8/SF
    factors.push('Declining neighborhood');
  }
  
  // Environmental factors
  if (subjectProperty.environmental?.issues?.length > 0) {
    obsolescence += subjectProperty.physical.buildingArea.grossBuildingArea * 3; // $3/SF
    factors.push('Environmental issues');
  }
  
  return {
    total: obsolescence,
    factors
  };
}

/**
 * Calculate effective age of building (may differ from actual age due to condition/maintenance)
 */
function calculateEffectiveAge(building, actualAge) {
  const condition = building?.construction?.condition?.toLowerCase() || 'average';
  
  // Condition adjustments to effective age
  let conditionMultiplier = 1.0;
  
  switch (condition) {
    case 'excellent':
      conditionMultiplier = 0.6; // Building acts younger than actual age
      break;
    case 'good':
      conditionMultiplier = 0.8;
      break;
    case 'average':
      conditionMultiplier = 1.0; // Effective age = actual age
      break;
    case 'fair':
      conditionMultiplier = 1.3; // Building acts older
      break;
    case 'poor':
      conditionMultiplier = 1.6; // Much older effective age
      break;
  }
  
  // Consider major renovations/updates (if available in data)
  const renovationAdjustment = 0; // Could be enhanced with renovation data
  
  const effectiveAge = Math.max(0, (actualAge * conditionMultiplier) - renovationAdjustment);
  
  return {
    actualAge,
    effectiveAge: Math.round(effectiveAge),
    conditionMultiplier,
    condition
  };
}

/**
 * Get market land value based on zoning and location
 */
function getMarketLandValue(zoning, location, marketData) {
  const neighborhood = location?.neighborhood?.toLowerCase() || 'b';
  
  // Base land values per SF by zoning type
  const baseLandValues = {
    'commercial': 25,
    'office': 30,
    'retail': 35,
    'industrial': 15,
    'mixed use': 28,
    'warehouse': 12,
    'flex': 20
  };
  
  // Find matching zoning category
  const zoningLower = zoning?.toLowerCase() || '';
  let baseValue = 20; // Default
  
  for (const [zone, value] of Object.entries(baseLandValues)) {
    if (zoningLower.includes(zone)) {
      baseValue = value;
      break;
    }
  }
  
  // Location adjustments
  let locationMultiplier = 1.0;
  
  if (neighborhood.includes('a')) {
    locationMultiplier = 1.3; // Premium location
  } else if (neighborhood.includes('b')) {
    locationMultiplier = 1.0; // Average location
  } else if (neighborhood.includes('c')) {
    locationMultiplier = 0.8; // Below average
  } else if (neighborhood.includes('d')) {
    locationMultiplier = 0.6; // Poor location
  }
  
  // Market conditions adjustment
  const marketConditions = marketData?.marketConditions?.landValues || 1.0;
  
  return baseValue * locationMultiplier * marketConditions;
}

/**
 * Calculate site improvements cost
 */
function calculateSiteImprovements(subjectProperty, marketData) {
  const landArea = subjectProperty.physical?.landArea?.sf || 0;
  const parkingSpaces = subjectProperty.physical?.parkingSpaces || 0;
  const location = subjectProperty.location;
  
  let totalCost = 0;
  const improvements = {};
  
  // Parking lot/garage
  if (parkingSpaces > 0) {
    const costPerSpace = 3500; // Average cost per parking space
    improvements.parking = {
      spaces: parkingSpaces,
      costPerSpace,
      totalCost: parkingSpaces * costPerSpace
    };
    totalCost += improvements.parking.totalCost;
  }
  
  // Site preparation and grading (estimated based on land area)
  if (landArea > 0) {
    const sitePrepCost = landArea * 2; // $2 per SF for basic site prep
    improvements.sitePreparation = {
      area: landArea,
      costPerSF: 2,
      totalCost: sitePrepCost
    };
    totalCost += sitePrepCost;
  }
  
  // Utilities (water, sewer, electric, gas)
  const utilityCost = Math.max(25000, landArea * 1.5); // Minimum $25k or $1.50/SF
  improvements.utilities = {
    totalCost: utilityCost
  };
  totalCost += utilityCost;
  
  // Landscaping
  const landscapingCost = landArea * 1.2; // $1.20 per SF
  improvements.landscaping = {
    area: landArea,
    costPerSF: 1.2,
    totalCost: landscapingCost
  };
  totalCost += landscapingCost;
  
  // Access roads and sidewalks
  const accessCost = landArea * 0.8; // $0.80 per SF
  improvements.access = {
    area: landArea,
    costPerSF: 0.8,
    totalCost: accessCost
  };
  totalCost += accessCost;
  
  return {
    totalCost,
    costPerSF: landArea > 0 ? totalCost / landArea : 0,
    breakdown: improvements
  };
}

/**
 * Helper functions
 */

function getConstructionCostPSF(propertyType, building, marketData) {
  // Base costs from market data or defaults
  const baseCosts = {
    'Office': 120,
    'Retail': 100,
    'Industrial': 60,
    'Warehouse': 45,
    'Multifamily': 110
  };
  
  return marketData.constructionCosts?.[propertyType] || baseCosts[propertyType] || 100;
}

function getQualityMultiplier(construction) {
  let multiplier = 1.0;
  
  // Construction type
  const typeMultipliers = {
    'steel_frame': 1.1,
    'concrete': 1.05,
    'masonry': 1.0,
    'wood_frame': 0.9,
    'metal': 0.85
  };
  
  multiplier *= typeMultipliers[construction.constructionType] || 1.0;
  
  // Finish quality
  if (construction.exteriorFinish === 'glass' || construction.exteriorFinish === 'stone') {
    multiplier *= 1.1;
  } else if (construction.exteriorFinish === 'metal' || construction.exteriorFinish === 'vinyl') {
    multiplier *= 0.9;
  }
  
  return multiplier;
}

function getSizeMultiplier(totalSF) {
  // Economies of scale
  if (totalSF > 100000) return 0.95;
  if (totalSF > 50000) return 0.97;
  if (totalSF > 20000) return 0.99;
  if (totalSF < 5000) return 1.05;
  return 1.0;
}

function getLocationCostMultiplier(location, marketData) {
  // Regional cost variations
  return marketData.costMultipliers?.[location.market] || 1.0;
}

function assessCostApproachApplicability(subjectProperty) {
  const buildingAge = new Date().getFullYear() - subjectProperty.physical.construction.yearBuilt;
  
  if (buildingAge < 5) return 'high';
  if (buildingAge < 15) return 'medium';
  if (buildingAge < 30) return 'low';
  return 'very_low';
}

function calculateCostConfidence(subjectProperty, applicability) {
  const confidenceMap = {
    'high': 85,
    'medium': 70,
    'low': 55,
    'very_low': 40
  };
  
  return confidenceMap[applicability] || 50;
}

function generateCostNarrative(landValue, replacementCost, depreciation, valueIndication) {
  return {
    summary: `The Cost Approach estimates the value at $${valueIndication.toLocaleString()}, based on land value of $${landValue.indication.toLocaleString()}, replacement cost of $${replacementCost.total.toLocaleString()}, less depreciation of $${depreciation.total.toLocaleString()}.`,
    
    applicability: 'The Cost Approach is most reliable for newer properties or special-use buildings where sales comparison data is limited.',
    
    limitations: 'This approach may not fully reflect market preferences and is less reliable for older properties with significant depreciation.'
  };
}

/**
 * Get economic life of building based on construction type and use
 */
function getEconomicLife(constructionType, propertyType) {
  const constructionTypeLower = constructionType?.toLowerCase() || 'wood_frame';
  const propertyTypeLower = propertyType?.toLowerCase() || 'office';
  
  // Base economic life by construction type (in years)
  const baseLife = {
    'wood_frame': 50,
    'steel_frame': 60,
    'concrete': 75,
    'masonry': 70,
    'reinforced_concrete': 80,
    'structural_steel': 65
  };
  
  // Property type adjustments
  const typeAdjustments = {
    'office': 1.0,
    'retail': 0.9,
    'warehouse': 1.1,
    'industrial': 1.2,
    'hotel': 0.8,
    'restaurant': 0.7,
    'medical': 0.9
  };
  
  let economicLife = baseLife[constructionTypeLower] || 55; // Default 55 years
  
  // Apply property type adjustment
  for (const [type, adjustment] of Object.entries(typeAdjustments)) {
    if (propertyTypeLower.includes(type)) {
      economicLife *= adjustment;
      break;
    }
  }
  
  return Math.round(economicLife);
}

/**
 * Identify curable deterioration items that should be fixed
 */
function identifyCurableItems(building) {
  const condition = building?.construction?.condition?.toLowerCase() || 'average';
  const age = building?.actualAge || 0;
  const constructionType = building?.construction?.constructionType?.toLowerCase() || 'steel_frame';
  
  const curableItems = [];
  let totalCost = 0;
  
  // Only identify curable items if condition is fair or poor
  if (condition === 'fair' || condition === 'poor') {
    
    // HVAC system repairs (common for older buildings)
    if (age > 15) {
      const hvacCost = 5 * (building?.grossBuildingArea || 15000); // $5/SF
      curableItems.push({
        item: 'HVAC System Repairs/Updates',
        cost: hvacCost,
        description: 'Repair and update aging HVAC system'
      });
      totalCost += hvacCost;
    }
    
    // Roofing repairs
    if (age > 10 || condition === 'poor') {
      const roofingCost = 12 * (building?.grossBuildingArea || 15000); // $12/SF for roof area
      curableItems.push({
        item: 'Roofing Repairs',
        cost: roofingCost,
        description: 'Repair/replace damaged roofing components'
      });
      totalCost += roofingCost;
    }
    
    // Flooring updates (for poor condition)
    if (condition === 'poor') {
      const flooringCost = 8 * (building?.grossBuildingArea || 15000); // $8/SF
      curableItems.push({
        item: 'Flooring Updates',
        cost: flooringCost,
        description: 'Replace worn flooring materials'
      });
      totalCost += flooringCost;
    }
    
    // Electrical updates for older buildings
    if (age > 20) {
      const electricalCost = 3 * (building?.grossBuildingArea || 15000); // $3/SF
      curableItems.push({
        item: 'Electrical System Updates',
        cost: electricalCost,
        description: 'Update aging electrical systems'
      });
      totalCost += electricalCost;
    }
    
    // Plumbing repairs
    if (age > 25 || condition === 'poor') {
      const plumbingCost = 4 * (building?.grossBuildingArea || 15000); // $4/SF
      curableItems.push({
        item: 'Plumbing Repairs',
        cost: plumbingCost,
        description: 'Repair aging plumbing systems'
      });
      totalCost += plumbingCost;
    }
  }
  
  return {
    items: curableItems,
    totalCost,
    costPerSF: totalCost / (building?.grossBuildingArea || 15000)
  };
}

/**
 * Calculate short-lived depreciation (mechanical systems, interior finishes)
 */
function calculateShortLivedDepreciation(building, replacementCost) {
  const effectiveAge = building?.effectiveAge || 6; // 2018 to 2024
  
  // Short-lived components and their typical life spans
  const shortLivedComponents = [
    { name: 'Interior Paint', life: 7, percentage: 0.03 },
    { name: 'Carpeting', life: 10, percentage: 0.05 },
    { name: 'HVAC Equipment', life: 20, percentage: 0.15 },
    { name: 'Plumbing Fixtures', life: 25, percentage: 0.08 },
    { name: 'Electrical Components', life: 30, percentage: 0.10 }
  ];
  
  let totalDepreciation = 0;
  const breakdown = {};
  
  shortLivedComponents.forEach(component => {
    const componentValue = replacementCost * component.percentage;
    const depreciationRate = Math.min(effectiveAge / component.life, 1.0);
    const componentDepreciation = componentValue * depreciationRate;
    
    breakdown[component.name] = {
      value: componentValue,
      life: component.life,
      depreciationRate,
      depreciation: componentDepreciation
    };
    
    totalDepreciation += componentDepreciation;
  });
  
  return {
    totalDepreciation,
    breakdown,
    effectiveAge
  };
}

/**
 * Calculate long-lived depreciation (structural components)
 */
function calculateLongLivedDepreciation(effectiveAge, economicLife, replacementCost) {
  // Long-lived items are structural components that last the full economic life
  const longLivedPercentage = 0.60; // 60% of building cost is long-lived (structure, foundation, etc.)
  const longLivedValue = replacementCost * longLivedPercentage;
  
  // Calculate depreciation rate
  const depreciationRate = Math.min(effectiveAge / economicLife, 1.0);
  const depreciation = longLivedValue * depreciationRate;
  
  return {
    longLivedValue,
    effectiveAge,
    economicLife,
    depreciationRate,
    depreciation
  };
}

module.exports = {
  calculateCostApproach,
  calculateLandValue,
  calculateReplacementCost,
  calculateDepreciation
};
