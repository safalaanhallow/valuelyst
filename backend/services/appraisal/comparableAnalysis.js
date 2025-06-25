/**
 * Comparable Analysis Service
 * Provides functions for analyzing and ranking comparable properties
 * Used by the Sales Comparison Approach
 */

/**
 * Analyze and rank comparables based on similarity to subject property
 * @param {Object} subjectProperty - Subject property details
 * @param {Array} comparables - Array of comparable properties
 * @returns {Array} Ranked comparables with similarity scores
 */
function analyzeComparables(subjectProperty, comparables) {
  try {
    const analyzedComparables = comparables.map(comp => {
      const analysis = {
        ...comp,
        similarity: calculateSimilarityScore(subjectProperty, comp),
        adjustmentRisk: assessAdjustmentRisk(subjectProperty, comp),
        dataQuality: assessComparableDataQuality(comp),
        marketSupport: assessMarketSupport(comp)
      };
      
      // Calculate overall ranking score
      analysis.rankingScore = calculateRankingScore(analysis);
      
      return analysis;
    });
    
    // Sort by ranking score (highest first)
    return analyzedComparables.sort((a, b) => b.rankingScore - a.rankingScore);
    
  } catch (error) {
    console.error('Error analyzing comparables:', error);
    throw new Error(`Comparable analysis failed: ${error.message}`);
  }
}

/**
 * Calculate similarity score between subject and comparable
 * @param {Object} subject - Subject property
 * @param {Object} comparable - Comparable property
 * @returns {number} Similarity score (0-100)
 */
function calculateSimilarityScore(subject, comparable) {
  let score = 100;
  
  try {
    // Property type similarity (25 points)
    if (subject.propertyType !== comparable.propertyType) {
      score -= 25;
    }
    
    // Size similarity (20 points)
    const subjectSize = subject.physical?.buildingArea?.grossBuildingArea || 0;
    const compSize = comparable.buildingSize || comparable.physical?.buildingArea?.grossBuildingArea || 0;
    
    if (subjectSize > 0 && compSize > 0) {
      const sizeDifference = Math.abs(subjectSize - compSize) / subjectSize;
      if (sizeDifference > 0.5) score -= 20;
      else if (sizeDifference > 0.3) score -= 15;
      else if (sizeDifference > 0.15) score -= 10;
      else if (sizeDifference > 0.05) score -= 5;
    }
    
    // Age similarity (15 points)
    const subjectAge = new Date().getFullYear() - (subject.physical?.construction?.yearBuilt || 2020);
    const compAge = new Date().getFullYear() - (comparable.yearBuilt || comparable.physical?.construction?.yearBuilt || 2020);
    
    const ageDifference = Math.abs(subjectAge - compAge);
    if (ageDifference > 20) score -= 15;
    else if (ageDifference > 10) score -= 10;
    else if (ageDifference > 5) score -= 5;
    
    // Location similarity (20 points)
    if (subject.location?.city && comparable.city) {
      if (subject.location.city.toLowerCase() !== comparable.city.toLowerCase()) {
        score -= 10;
      }
    }
    
    if (subject.location?.neighborhood && comparable.location?.neighborhood) {
      const subjectNeighborhood = subject.location.neighborhood;
      const compNeighborhood = comparable.location.neighborhood;
      
      // Simple neighborhood grade comparison (A+, A, A-, B+, B, B-, etc.)
      const neighborhoodDiff = Math.abs(
        parseNeighborhoodGrade(subjectNeighborhood) - parseNeighborhoodGrade(compNeighborhood)
      );
      
      if (neighborhoodDiff > 2) score -= 10;
      else if (neighborhoodDiff > 1) score -= 5;
    }
    
    // Sale date recency (10 points)
    if (comparable.saleDate) {
      const saleDate = new Date(comparable.saleDate);
      const monthsAgo = (new Date() - saleDate) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsAgo > 24) score -= 10;
      else if (monthsAgo > 12) score -= 7;
      else if (monthsAgo > 6) score -= 3;
    }
    
    // Cap rate availability (10 points bonus for income properties)
    if (subject.income && comparable.capRate && comparable.capRate > 0) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
    
  } catch (error) {
    console.warn('Error calculating similarity score:', error);
    return 50; // Default moderate similarity
  }
}

/**
 * Assess adjustment risk for a comparable
 * @param {Object} subject - Subject property
 * @param {Object} comparable - Comparable property
 * @returns {string} Risk level: 'low', 'moderate', 'high'
 */
function assessAdjustmentRisk(subject, comparable) {
  try {
    let riskFactors = 0;
    
    // Large size difference
    const subjectSize = subject.physical?.buildingArea?.grossBuildingArea || 0;
    const compSize = comparable.buildingSize || comparable.physical?.buildingArea?.grossBuildingArea || 0;
    
    if (subjectSize > 0 && compSize > 0) {
      const sizeDifference = Math.abs(subjectSize - compSize) / subjectSize;
      if (sizeDifference > 0.5) riskFactors += 2;
      else if (sizeDifference > 0.3) riskFactors += 1;
    }
    
    // Property type mismatch
    if (subject.propertyType !== comparable.propertyType) {
      riskFactors += 2;
    }
    
    // Large age difference
    const subjectAge = new Date().getFullYear() - (subject.physical?.construction?.yearBuilt || 2020);
    const compAge = new Date().getFullYear() - (comparable.yearBuilt || comparable.physical?.construction?.yearBuilt || 2020);
    
    if (Math.abs(subjectAge - compAge) > 15) {
      riskFactors += 1;
    }
    
    // Location difference
    if (subject.location?.city && comparable.city) {
      if (subject.location.city.toLowerCase() !== comparable.city.toLowerCase()) {
        riskFactors += 1;
      }
    }
    
    // Sale date (old sales require more adjustment)
    if (comparable.saleDate) {
      const monthsAgo = (new Date() - new Date(comparable.saleDate)) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo > 18) riskFactors += 1;
    }
    
    if (riskFactors >= 4) return 'high';
    if (riskFactors >= 2) return 'moderate';
    return 'low';
    
  } catch (error) {
    console.warn('Error assessing adjustment risk:', error);
    return 'moderate';
  }
}

/**
 * Assess data quality for a comparable
 * @param {Object} comparable - Comparable property
 * @returns {number} Quality score (0-100)
 */
function assessComparableDataQuality(comparable) {
  try {
    let score = 0;
    let maxScore = 0;
    
    // Required fields
    const requiredFields = [
      'salePrice', 'saleDate', 'buildingSize', 'propertyType', 'address'
    ];
    
    requiredFields.forEach(field => {
      maxScore += 15;
      if (comparable[field] && comparable[field] !== 0 && comparable[field] !== '') {
        score += 15;
      }
    });
    
    // Additional useful fields
    const usefulFields = [
      'yearBuilt', 'lotSize', 'capRate', 'city', 'state'
    ];
    
    usefulFields.forEach(field => {
      maxScore += 5;
      if (comparable[field] && comparable[field] !== 0 && comparable[field] !== '') {
        score += 5;
      }
    });
    
    return Math.round((score / maxScore) * 100);
    
  } catch (error) {
    console.warn('Error assessing data quality:', error);
    return 50;
  }
}

/**
 * Assess market support for a comparable
 * @param {Object} comparable - Comparable property
 * @returns {string} Market support level: 'strong', 'moderate', 'weak'
 */
function assessMarketSupport(comparable) {
  try {
    let supportScore = 0;
    
    // Recent sale date
    if (comparable.saleDate) {
      const monthsAgo = (new Date() - new Date(comparable.saleDate)) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo <= 6) supportScore += 3;
      else if (monthsAgo <= 12) supportScore += 2;
      else if (monthsAgo <= 18) supportScore += 1;
    }
    
    // Market conditions (if available)
    if (comparable.marketConditions === 'strong' || comparable.marketConditions === 'balanced') {
      supportScore += 2;
    }
    
    // Financing terms
    if (comparable.financing === 'conventional' || comparable.financing === 'cash') {
      supportScore += 2;
    }
    
    // Property rights
    if (comparable.propertyRights === 'fee_simple') {
      supportScore += 1;
    }
    
    // Complete transaction data
    if (comparable.salePrice > 0 && comparable.buildingSize > 0) {
      supportScore += 2;
    }
    
    if (supportScore >= 7) return 'strong';
    if (supportScore >= 4) return 'moderate';
    return 'weak';
    
  } catch (error) {
    console.warn('Error assessing market support:', error);
    return 'moderate';
  }
}

/**
 * Calculate overall ranking score for sorting comparables
 * @param {Object} comparable - Analyzed comparable with scores
 * @returns {number} Ranking score
 */
function calculateRankingScore(comparable) {
  try {
    let score = 0;
    
    // Similarity score (40% weight)
    score += (comparable.similarity || 50) * 0.4;
    
    // Data quality (30% weight)
    score += (comparable.dataQuality || 50) * 0.3;
    
    // Adjustment risk (20% weight - lower risk = higher score)
    const riskScore = comparable.adjustmentRisk === 'low' ? 100 : 
                     comparable.adjustmentRisk === 'moderate' ? 70 : 40;
    score += riskScore * 0.2;
    
    // Market support (10% weight)
    const supportScore = comparable.marketSupport === 'strong' ? 100 : 
                        comparable.marketSupport === 'moderate' ? 70 : 40;
    score += supportScore * 0.1;
    
    return Math.round(score);
    
  } catch (error) {
    console.warn('Error calculating ranking score:', error);
    return 50;
  }
}

/**
 * Parse neighborhood grade to numeric value for comparison
 * @param {string} grade - Neighborhood grade (A+, A, A-, B+, B, B-, C+, C, C-, D)
 * @returns {number} Numeric value
 */
function parseNeighborhoodGrade(grade) {
  const gradeMap = {
    'A+': 10, 'A': 9, 'A-': 8,
    'B+': 7, 'B': 6, 'B-': 5,
    'C+': 4, 'C': 3, 'C-': 2,
    'D+': 1, 'D': 0, 'D-': -1
  };
  
  return gradeMap[grade] || 5; // Default to B- if unknown
}

/**
 * Filter comparables based on minimum criteria
 * @param {Array} comparables - Array of comparables
 * @param {Object} criteria - Filtering criteria
 * @returns {Array} Filtered comparables
 */
function filterComparables(comparables, criteria = {}) {
  try {
    return comparables.filter(comp => {
      // Minimum data requirements
      if (!comp.salePrice || comp.salePrice <= 0) return false;
      if (!comp.buildingSize || comp.buildingSize <= 0) return false;
      if (!comp.saleDate) return false;
      
      // Sale date recency (default: within 3 years)
      const maxMonthsAgo = criteria.maxSaleAge || 36;
      const monthsAgo = (new Date() - new Date(comp.saleDate)) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo > maxMonthsAgo) return false;
      
      // Size range filter (default: 50% to 200% of subject)
      if (criteria.subjectSize) {
        const sizeRatio = comp.buildingSize / criteria.subjectSize;
        const minRatio = criteria.minSizeRatio || 0.5;
        const maxRatio = criteria.maxSizeRatio || 2.0;
        if (sizeRatio < minRatio || sizeRatio > maxRatio) return false;
      }
      
      // Minimum similarity score
      if (criteria.minSimilarity && comp.similarity < criteria.minSimilarity) return false;
      
      return true;
    });
    
  } catch (error) {
    console.warn('Error filtering comparables:', error);
    return comparables; // Return unfiltered on error
  }
}

module.exports = {
  analyzeComparables,
  calculateSimilarityScore,
  assessAdjustmentRisk,
  assessComparableDataQuality,
  assessMarketSupport,
  calculateRankingScore,
  filterComparables
};
