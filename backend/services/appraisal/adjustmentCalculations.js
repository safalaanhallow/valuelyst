/**
 * Comprehensive Adjustment Calculations
 * Industry Standard Adjustment Methodologies
 */

/**
 * Calculate Property Rights adjustment
 */
function calculatePropertyRightsAdjustment(subject, comparable) {
  // Most commercial sales are fee simple, minimal adjustment needed
  const subjectRights = subject.legal?.propertyRights || 'fee_simple';
  const compRights = comparable.propertyRights || 'fee_simple';
  
  let adjustment = 0;
  
  if (subjectRights === 'fee_simple' && compRights === 'leased_fee') {
    adjustment = -0.05; // 5% reduction for leased fee
  } else if (subjectRights === 'leased_fee' && compRights === 'fee_simple') {
    adjustment = 0.05; // 5% increase for fee simple
  }
  
  return {
    type: 'percent',
    amount: adjustment,
    explanation: `Adjustment for property rights: ${subjectRights} vs ${compRights}`,
    confidence: 'medium'
  };
}

/**
 * Calculate Financing Terms adjustment
 */
function calculateFinancingAdjustment(comparable, marketData) {
  const financing = comparable.financing;
  
  if (!financing || financing.cashEquivalent) {
    return {
      type: 'percent',
      amount: 0,
      explanation: 'Cash equivalent sale, no financing adjustment needed',
      confidence: 'high'
    };
  }
  
  // Calculate adjustment for below-market financing
  const marketRate = marketData.financing?.marketInterestRate || 7.0;
  const actualRate = financing.interestRate || marketRate;
  
  let adjustment = 0;
  
  if (actualRate < marketRate - 0.5) {
    // Below market financing benefits buyer, reduce sale price
    const rateDiff = marketRate - actualRate;
    adjustment = -Math.min(0.1, rateDiff * 0.02); // Max 10% adjustment
  }
  
  return {
    type: 'percent',
    amount: adjustment,
    explanation: `Financing adjustment: ${actualRate}% vs market ${marketRate}%`,
    confidence: 'medium'
  };
}

/**
 * Calculate Sale Conditions adjustment
 */
function calculateSaleConditionsAdjustment(comparable) {
  const conditions = comparable.saleConditions?.toLowerCase() || 'arms_length';
  let adjustment = 0;
  let explanation = 'Arms-length transaction, no adjustment needed';
  
  if (conditions.includes('distressed') || conditions.includes('foreclosure')) {
    adjustment = 0.15; // 15% upward adjustment for distressed sales
    explanation = 'Distressed sale conditions, upward adjustment applied';
  } else if (conditions.includes('related_party') || conditions.includes('family')) {
    adjustment = 0.05; // 5% adjustment for related party transactions
    explanation = 'Related party transaction, adjustment applied';
  } else if (conditions.includes('auction')) {
    adjustment = 0.08; // 8% adjustment for auction sales
    explanation = 'Auction sale, upward adjustment applied';
  }
  
  return {
    type: 'percent',
    amount: adjustment,
    explanation,
    confidence: 'high'
  };
}

/**
 * Calculate Market Conditions (Time) adjustment
 */
function calculateTimeAdjustment(saleDate, marketData) {
  const saleDateTime = new Date(saleDate).getTime();
  const currentTime = Date.now();
  const monthsDiff = (currentTime - saleDateTime) / (1000 * 60 * 60 * 24 * 30.44);
  
  // Get market appreciation rate (default 3% annually if not provided)
  const annualAppreciation = marketData.appreciation?.annualRate || 0.03;
  const monthlyAppreciation = annualAppreciation / 12;
  
  const adjustment = monthsDiff * monthlyAppreciation;
  
  return {
    type: 'percent',
    amount: Math.min(0.25, Math.max(-0.15, adjustment)), // Cap at +25%/-15%
    explanation: `Market conditions adjustment: ${monthsDiff.toFixed(1)} months at ${(annualAppreciation * 100).toFixed(1)}% annual`,
    confidence: 'medium',
    monthsDiff: monthsDiff.toFixed(1)
  };
}

/**
 * Calculate Location adjustment
 */
function calculateLocationAdjustment(subject, comparable, marketData) {
  const subjectLocation = subject.location;
  const compLocation = comparable.location;
  
  let adjustment = 0;
  let factors = [];
  
  // Neighborhood quality adjustment
  if (subjectLocation.neighborhood && compLocation.neighborhood) {
    const neighborhoodDiff = getNeighborhoodRating(subjectLocation.neighborhood, marketData) - 
                            getNeighborhoodRating(compLocation.neighborhood, marketData);
    adjustment += neighborhoodDiff * 0.02; // 2% per rating point
    factors.push(`Neighborhood: ${neighborhoodDiff} points`);
  }
  
  // Transportation access
  if (subjectLocation.transportation && compLocation.transportation) {
    const accessDiff = calculateTransportationScore(subjectLocation.transportation) - 
                      calculateTransportationScore(compLocation.transportation);
    adjustment += accessDiff * 0.01; // 1% per score point
    factors.push(`Transportation: ${accessDiff} points`);
  }
  
  // Distance from CBD or major employment centers
  const subjectDistance = subjectLocation.distanceFromCBD || 0;
  const compDistance = compLocation.distanceFromCBD || 0;
  const distanceDiff = compDistance - subjectDistance; // Positive if comp is farther
  
  if (Math.abs(distanceDiff) > 2) { // Only adjust if >2 miles difference
    adjustment += distanceDiff * 0.005; // 0.5% per mile
    factors.push(`Distance from CBD: ${distanceDiff.toFixed(1)} miles`);
  }
  
  return {
    type: 'percent',
    amount: Math.min(0.2, Math.max(-0.2, adjustment)), // Cap at +/-20%
    explanation: `Location adjustment factors: ${factors.join(', ')}`,
    confidence: 'medium',
    factors
  };
}

/**
 * Calculate Size adjustment
 */
function calculateSizeAdjustment(subject, comparable) {
  const subjectSize = subject.physical.buildingArea.netRentableArea;
  const compSize = comparable.buildingArea;
  
  const sizeRatio = compSize / subjectSize;
  let adjustment = 0;
  
  // Economies of scale - larger properties typically have lower $/SF
  if (sizeRatio > 1.5) {
    // Comparable is significantly larger
    adjustment = Math.min(0.15, (sizeRatio - 1) * 0.1); // Max 15% adjustment
  } else if (sizeRatio < 0.67) {
    // Comparable is significantly smaller
    adjustment = Math.max(-0.15, (1 - sizeRatio) * -0.1); // Max -15% adjustment
  }
  
  return {
    type: 'percent',
    amount: adjustment,
    explanation: `Size adjustment: ${compSize.toLocaleString()} SF vs ${subjectSize.toLocaleString()} SF (${(sizeRatio * 100).toFixed(0)}%)`,
    confidence: 'high',
    sizeRatio: sizeRatio.toFixed(2)
  };
}

/**
 * Calculate Age adjustment
 */
function calculateAgeAdjustment(subject, comparable) {
  const currentYear = new Date().getFullYear();
  const subjectAge = currentYear - subject.physical.construction.yearBuilt;
  const compAge = currentYear - comparable.yearBuilt;
  
  const ageDiff = compAge - subjectAge; // Positive if comp is older
  
  // Age adjustment: approximately 0.5% per year difference
  let adjustment = ageDiff * -0.005; // Negative for older properties
  
  // Cap adjustments at +/-20%
  adjustment = Math.min(0.2, Math.max(-0.2, adjustment));
  
  return {
    type: 'percent',
    amount: adjustment,
    explanation: `Age adjustment: ${compAge} years vs ${subjectAge} years (${ageDiff} year difference)`,
    confidence: 'high',
    ageDifference: ageDiff
  };
}

/**
 * Calculate Condition adjustment
 */
function calculateConditionAdjustment(subject, comparable) {
  const subjectCondition = subject.physical.condition.overall || 3; // 1-5 scale
  const compCondition = comparable.condition || 3;
  
  const conditionDiff = subjectCondition - compCondition;
  
  // 5% adjustment per condition point
  const adjustment = conditionDiff * 0.05;
  
  const conditionLabels = {
    1: 'Poor',
    2: 'Fair', 
    3: 'Average',
    4: 'Good',
    5: 'Excellent'
  };
  
  return {
    type: 'percent',
    amount: Math.min(0.2, Math.max(-0.2, adjustment)), // Cap at +/-20%
    explanation: `Condition adjustment: ${conditionLabels[subjectCondition]} vs ${conditionLabels[compCondition]}`,
    confidence: 'medium',
    conditionDifference: conditionDiff
  };
}

/**
 * Calculate Quality/Construction adjustment
 */
function calculateQualityAdjustment(subject, comparable) {
  const subjectQuality = getConstructionQualityScore(subject.physical.construction);
  const compQuality = getConstructionQualityScore(comparable.construction || {});
  
  const qualityDiff = subjectQuality - compQuality;
  
  // 3% adjustment per quality point
  const adjustment = qualityDiff * 0.03;
  
  return {
    type: 'percent',
    amount: Math.min(0.15, Math.max(-0.15, adjustment)), // Cap at +/-15%
    explanation: `Quality adjustment: ${subjectQuality} vs ${compQuality} quality score`,
    confidence: 'medium',
    qualityDifference: qualityDiff
  };
}

/**
 * Calculate Functional Utility adjustment
 */
function calculateFunctionalUtilityAdjustment(subject, comparable) {
  let adjustment = 0;
  let factors = [];
  
  // HVAC systems
  if (subject.physical.building.hvacType !== comparable.hvacType) {
    const hvacScore = getHVACScore(subject.physical.building.hvacType) - 
                     getHVACScore(comparable.hvacType);
    adjustment += hvacScore * 0.02; // 2% per score difference
    factors.push(`HVAC: ${hvacScore}`);
  }
  
  // Parking ratio
  const subjectParking = subject.physical.building.parkingSpaces.ratio || 0;
  const compParking = comparable.parkingRatio || 0;
  const parkingDiff = subjectParking - compParking;
  
  if (Math.abs(parkingDiff) > 1) {
    adjustment += parkingDiff * 0.01; // 1% per space per 1000 SF
    factors.push(`Parking: ${parkingDiff.toFixed(1)} spaces/1000SF`);
  }
  
  // Loading docks (for industrial/warehouse)
  if (subject.propertyType === 'Industrial' || subject.propertyType === 'Warehouse') {
    const subjectDocks = subject.physical.building.loadingDocks || 0;
    const compDocks = comparable.loadingDocks || 0;
    const dockDiff = subjectDocks - compDocks;
    
    if (Math.abs(dockDiff) > 0) {
      adjustment += dockDiff * 0.005; // 0.5% per dock
      factors.push(`Loading docks: ${dockDiff}`);
    }
  }
  
  return {
    type: 'percent',
    amount: Math.min(0.1, Math.max(-0.1, adjustment)), // Cap at +/-10%
    explanation: `Functional utility factors: ${factors.join(', ')}`,
    confidence: 'low',
    factors
  };
}

/**
 * Calculate Lease Terms adjustment (for income properties)
 */
function calculateLeaseTermsAdjustment(subject, comparable) {
  if (!subject.income || !comparable.income) {
    return {
      type: 'percent',
      amount: 0,
      explanation: 'No lease data available for adjustment',
      confidence: 'low'
    };
  }
  
  // Calculate weighted average lease term
  const subjectAvgTerm = calculateAverageLeaseLength(subject.income.rentRoll);
  const compAvgTerm = calculateAverageLeaseLength(comparable.income.rentRoll);
  
  const termDiff = subjectAvgTerm - compAvgTerm;
  
  // Longer lease terms generally increase value (stability)
  const adjustment = termDiff * 0.001; // 0.1% per month difference
  
  return {
    type: 'percent',
    amount: Math.min(0.05, Math.max(-0.05, adjustment)), // Cap at +/-5%
    explanation: `Lease term adjustment: ${subjectAvgTerm.toFixed(1)} vs ${compAvgTerm.toFixed(1)} months average`,
    confidence: 'medium',
    termDifference: termDiff.toFixed(1)
  };
}

/**
 * Calculate Tenant Quality adjustment
 */
function calculateTenantQualityAdjustment(subject, comparable) {
  if (!subject.income || !comparable.income) {
    return {
      type: 'percent',
      amount: 0,
      explanation: 'No tenant data available for adjustment',
      confidence: 'low'
    };
  }
  
  const subjectQuality = calculateTenantQualityScore(subject.income.rentRoll);
  const compQuality = calculateTenantQualityScore(comparable.income.rentRoll);
  
  const qualityDiff = subjectQuality - compQuality;
  
  // 2% adjustment per quality score difference
  const adjustment = qualityDiff * 0.02;
  
  return {
    type: 'percent',
    amount: Math.min(0.1, Math.max(-0.1, adjustment)), // Cap at +/-10%
    explanation: `Tenant quality adjustment: ${subjectQuality.toFixed(1)} vs ${compQuality.toFixed(1)} score`,
    confidence: 'medium',
    qualityDifference: qualityDiff.toFixed(1)
  };
}

/**
 * Helper Functions
 */

function getNeighborhoodRating(neighborhood, marketData) {
  // Return rating 1-5 based on market data or defaults
  return marketData.neighborhoods?.[neighborhood]?.rating || 3;
}

function calculateTransportationScore(transportation) {
  let score = 0;
  
  if (transportation.highways?.length > 0) score += 2;
  if (transportation.publicTransit?.length > 0) score += 1;
  if (transportation.airport && transportation.airport !== 'none') score += 1;
  if (transportation.walkScore > 70) score += 1;
  
  return score;
}

function getConstructionQualityScore(construction) {
  let score = 3; // Base score
  
  // Construction type scoring
  const typeScores = {
    'steel_frame': 5,
    'concrete': 4,
    'masonry': 3,
    'wood_frame': 2,
    'metal': 2
  };
  
  score = typeScores[construction.constructionType] || 3;
  
  // Adjust for other factors
  if (construction.roofType === 'new' || construction.roofType === 'membrane') score += 0.5;
  if (construction.exteriorFinish === 'glass' || construction.exteriorFinish === 'stone') score += 0.5;
  
  return Math.min(5, Math.max(1, score));
}

function getHVACScore(hvacType) {
  const scores = {
    'central_air': 4,
    'package_units': 3,
    'window_units': 1,
    'none': 0,
    'geothermal': 5,
    'chilled_water': 5
  };
  
  return scores[hvacType] || 2;
}

function calculateAverageLeaseLength(rentRoll) {
  if (!rentRoll || rentRoll.length === 0) return 0;
  
  const totalWeightedMonths = rentRoll.reduce((sum, lease) => {
    const leaseStart = new Date(lease.leaseStart);
    const leaseEnd = new Date(lease.leaseEnd);
    const months = (leaseEnd - leaseStart) / (1000 * 60 * 60 * 24 * 30.44);
    return sum + (months * lease.sf);
  }, 0);
  
  const totalSF = rentRoll.reduce((sum, lease) => sum + lease.sf, 0);
  
  return totalSF > 0 ? totalWeightedMonths / totalSF : 0;
}

function calculateTenantQualityScore(rentRoll) {
  if (!rentRoll || rentRoll.length === 0) return 3;
  
  const scores = rentRoll.map(lease => {
    let score = 3; // Base score
    
    // Credit rating scoring
    if (lease.creditRating) {
      const ratings = {
        'AAA': 5, 'AA': 4.5, 'A': 4,
        'BBB': 3.5, 'BB': 3, 'B': 2.5,
        'CCC': 2, 'CC': 1.5, 'C': 1
      };
      score = ratings[lease.creditRating] || 3;
    }
    
    // Adjust for lease length (longer = more stable)
    const leaseMonths = (new Date(lease.leaseEnd) - new Date(lease.leaseStart)) / (1000 * 60 * 60 * 24 * 30.44);
    if (leaseMonths > 60) score += 0.5; // 5+ year lease
    else if (leaseMonths < 12) score -= 0.5; // Less than 1 year
    
    return score * lease.sf;
  });
  
  const totalSF = rentRoll.reduce((sum, lease) => sum + lease.sf, 0);
  const weightedScore = scores.reduce((sum, score) => sum + score, 0);
  
  return totalSF > 0 ? weightedScore / totalSF : 3;
}

module.exports = {
  calculatePropertyRightsAdjustment,
  calculateFinancingAdjustment,
  calculateSaleConditionsAdjustment,
  calculateTimeAdjustment,
  calculateLocationAdjustment,
  calculateSizeAdjustment,
  calculateAgeAdjustment,
  calculateConditionAdjustment,
  calculateQualityAdjustment,
  calculateFunctionalUtilityAdjustment,
  calculateLeaseTermsAdjustment,
  calculateTenantQualityAdjustment
};
