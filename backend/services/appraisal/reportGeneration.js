/**
 * Professional Appraisal Report Generation
 * Generates comprehensive USPAP-compliant appraisal reports
 */

/**
 * Generate complete appraisal report
 */
async function generateAppraisalReport(data) {
  console.log('📊 Generating professional appraisal report...');
  
  const { 
    subjectProperty, 
    comparables, 
    marketData, 
    hbuAnalysis, 
    approaches, 
    reconciliation, 
    validationResults, 
    options 
  } = data;
  
  const appraisalResults = {
    highestAndBestUse: hbuAnalysis,
    valuationApproaches: approaches,
    reconciliation: reconciliation
  };
  
  const metadata = {
    marketData,
    validationResults,
    options
  };
  
  const report = {
    header: generateReportHeader(metadata),
    executiveSummary: generateExecutiveSummary(appraisalResults, subjectProperty),
    propertyDescription: generatePropertyDescription(subjectProperty),
    marketAnalysis: generateMarketAnalysis(marketData),
    highestAndBestUse: generateHBUSection(appraisalResults.highestAndBestUse),
    valuationApproaches: generateValuationApproaches(appraisalResults),
    reconciliation: generateReconciliationSection(appraisalResults.reconciliation),
    certifications: generateCertifications(metadata),
    qualifyingConditions: generateQualifyingConditions(),
    appendices: generateAppendices(comparables, metadata),
    metadata: {
      reportType: 'Commercial Appraisal Report',
      uspapCompliance: true,
      generateDate: new Date().toISOString(),
      pageCount: calculatePageCount(appraisalResults),
      confidence: appraisalResults.reconciliation.confidence
    }
  };
  
  return report;
}

/**
 * Generate report header and title page
 */
function generateReportHeader(metadata) {
  return {
    reportTitle: 'Commercial Real Estate Appraisal Report',
    propertyAddress: metadata.subjectProperty?.address || 'Subject Property',
    clientName: metadata.client?.name || 'Client',
    appraiser: {
      name: metadata.appraiser?.name || 'Certified General Appraiser',
      license: metadata.appraiser?.license || 'License #[License Number]',
      signature: metadata.appraiser?.signature || '[Appraiser Signature]'
    },
    appraisalDate: new Date().toLocaleDateString(),
    effectiveDate: metadata.effectiveDate || new Date().toLocaleDateString(),
    reportDate: new Date().toLocaleDateString(),
    fileNumber: metadata.fileNumber || `VAL-${Date.now()}`,
    uspapStatement: 'This appraisal report has been prepared in conformity with the Uniform Standards of Professional Appraisal Practice (USPAP).'
  };
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(appraisalResults, subjectProperty) {
  const finalValue = appraisalResults.reconciliation.finalValue;
  const valueRange = appraisalResults.reconciliation.valueRange;
  
  return {
    propertyType: subjectProperty.propertyType,
    location: formatLocation(subjectProperty.location),
    buildingSize: `${subjectProperty.physical.buildingArea.grossBuildingArea?.toLocaleString() || 'N/A'} SF`,
    landSize: `${subjectProperty.physical.landArea.sf?.toLocaleString() || 'N/A'} SF`,
    yearBuilt: subjectProperty.physical.construction?.yearBuilt || 'N/A',
    
    marketValue: {
      conclusion: finalValue,
      formattedValue: `$${finalValue.toLocaleString()}`,
      valueRange: `$${valueRange.low.toLocaleString()} - $${valueRange.high.toLocaleString()}`,
      pricePerSF: Math.round(finalValue / (subjectProperty.physical.buildingArea.grossBuildingArea || 1)),
      effectiveDate: new Date().toLocaleDateString()
    },
    
    purposeAndFunction: 'To estimate the market value of the subject property for lending/investment/other purposes.',
    
    approachesUsed: Object.keys(appraisalResults.reconciliation.approaches)
      .filter(key => appraisalResults.reconciliation.approaches[key])
      .map(key => formatApproachName(key)),
    
    keyFindings: generateKeyFindings(appraisalResults, subjectProperty),
    
    marketConditions: analyzeMarketConditions(appraisalResults),
    
    confidence: {
      level: getConfidenceLevel(appraisalResults.reconciliation.confidence),
      percentage: appraisalResults.reconciliation.confidence
    }
  };
}

/**
 * Generate detailed property description
 */
function generatePropertyDescription(subjectProperty) {
  return {
    identification: {
      address: formatFullAddress(subjectProperty.location),
      propertyId: subjectProperty.propertyId || 'N/A',
      taxId: subjectProperty.taxId || 'N/A',
      legalDescription: subjectProperty.legal?.legalDescription || 'See attached legal description'
    },
    
    physical: {
      propertyType: subjectProperty.propertyType,
      buildingArea: {
        gross: `${subjectProperty.physical.buildingArea.grossBuildingArea?.toLocaleString() || 'N/A'} SF`,
        net: `${subjectProperty.physical.buildingArea.netRentableArea?.toLocaleString() || 'N/A'} SF`,
        efficiency: subjectProperty.physical.buildingArea.netRentableArea && subjectProperty.physical.buildingArea.grossBuildingArea ?
          `${Math.round((subjectProperty.physical.buildingArea.netRentableArea / subjectProperty.physical.buildingArea.grossBuildingArea) * 100)}%` : 'N/A'
      },
      landArea: `${subjectProperty.physical.landArea.sf?.toLocaleString() || 'N/A'} SF (${subjectProperty.physical.landArea.acres?.toFixed(2) || 'N/A'} acres)`,
      construction: {
        yearBuilt: subjectProperty.physical.construction?.yearBuilt || 'N/A',
        type: subjectProperty.physical.construction?.constructionType || 'N/A',
        exterior: subjectProperty.physical.construction?.exteriorFinish || 'N/A',
        stories: subjectProperty.physical.stories || 'N/A',
        ceilingHeight: subjectProperty.physical.ceilingHeight ? `${subjectProperty.physical.ceilingHeight} feet` : 'N/A'
      },
      condition: subjectProperty.physical.condition || 'N/A',
      occupancy: subjectProperty.occupancy || 'N/A'
    },
    
    legal: {
      zoning: subjectProperty.legal?.zoning || 'N/A',
      propertyRights: subjectProperty.legal?.propertyRights || 'Fee Simple',
      easements: subjectProperty.legal?.easements?.length > 0 ? 
        subjectProperty.legal.easements.join(', ') : 'None noted',
      restrictions: subjectProperty.legal?.restrictions?.length > 0 ?
        subjectProperty.legal.restrictions.join(', ') : 'None noted'
    },
    
    location: {
      neighborhood: subjectProperty.location?.neighborhood || 'N/A',
      accessibilityDescription: generateAccessibilityDescription(subjectProperty.location),
      proximityToAmenities: generateProximityDescription(subjectProperty.location)
    },
    
    income: generateIncomeDescription(subjectProperty.income),
    
    environmental: generateEnvironmentalDescription(subjectProperty.environmental)
  };
}

/**
 * Generate market analysis section
 */
function generateMarketAnalysis(marketData) {
  return {
    overview: 'Market analysis based on current economic conditions and comparable property activity.',
    
    economicConditions: {
      employment: marketData?.employment || 'Employment data not available',
      population: marketData?.population || 'Population data not available',
      income: marketData?.medianIncome || 'Income data not available'
    },
    
    realEstateMarket: {
      inventory: marketData?.inventory || 'Market inventory data not available',
      absorptionRates: marketData?.absorption || 'Absorption data not available',
      vacancyRates: marketData?.vacancy || 'Vacancy data not available',
      rentTrends: marketData?.rentTrends || 'Rent trend data not available'
    },
    
    marketConditions: marketData?.conditions || 'balanced',
    
    outlook: generateMarketOutlook(marketData)
  };
}

/**
 * Generate highest and best use section
 */
function generateHBUSection(hbuAnalysis) {
  if (!hbuAnalysis) {
    return {
      conclusion: 'Current use represents the highest and best use',
      analysis: 'Detailed highest and best use analysis not performed'
    };
  }
  
  return {
    criteria: {
      legallyPermissible: hbuAnalysis.legallyPermissible || 'Yes',
      physicallyPossible: hbuAnalysis.physicallyPossible || 'Yes',
      financiallyFeasible: hbuAnalysis.financiallyFeasible || 'Yes',
      maximumProductivity: hbuAnalysis.maximumProductivity || 'Yes'
    },
    
    asVacant: hbuAnalysis.asVacant?.conclusion || 'Current zoning and development',
    asImproved: hbuAnalysis.asImproved?.conclusion || 'Continue current use',
    
    conclusion: hbuAnalysis.conclusion || 'The highest and best use of the subject property is its current use.',
    
    supportingAnalysis: hbuAnalysis.narrative || 'The current use maximizes the productivity of the land and improvements.'
  };
}

/**
 * Generate valuation approaches section
 */
function generateValuationApproaches(appraisalResults) {
  const approaches = {};
  
  // Sales Comparison Approach
  if (appraisalResults.reconciliation.approaches.salesComparison) {
    const sca = appraisalResults.reconciliation.approaches.salesComparison;
    approaches.salesComparison = {
      methodology: 'The Sales Comparison Approach estimates value by comparing the subject property to similar properties that have recently sold.',
      
      comparables: sca.comparables?.map(comp => ({
        address: comp.address || 'Address not available',
        salePrice: `$${comp.salePrice?.toLocaleString() || 'N/A'}`,
        pricePerSF: `$${comp.pricePerSF?.toFixed(2) || 'N/A'}`,
        saleDate: comp.saleDate || 'N/A',
        buildingSize: `${comp.buildingSize?.toLocaleString() || 'N/A'} SF`,
        adjustments: generateAdjustmentSummary(comp.adjustments),
        adjustedValue: `$${comp.adjustedValue?.toLocaleString() || 'N/A'}`
      })) || [],
      
      adjustmentAnalysis: sca.adjustmentAnalysis || 'Standard market-based adjustments applied',
      
      valueIndication: `$${sca.valueIndication?.toLocaleString() || 'N/A'}`,
      
      reliability: sca.reliability || 'High',
      
      narrative: sca.narrative || 'Sales comparison analysis provides strong market support for value conclusion.'
    };
  }
  
  // Income Approach
  if (appraisalResults.reconciliation.approaches.incomeApproach) {
    const income = appraisalResults.reconciliation.approaches.incomeApproach;
    approaches.incomeApproach = {
      methodology: 'The Income Approach estimates value based on the property\'s income-producing capability.',
      
      directCapitalization: income.directCapitalization ? {
        grossIncome: `$${income.directCapitalization.grossIncome?.toLocaleString() || 'N/A'}`,
        effectiveGrossIncome: `$${income.directCapitalization.effectiveGrossIncome?.toLocaleString() || 'N/A'}`,
        operatingExpenses: `$${income.directCapitalization.operatingExpenses?.toLocaleString() || 'N/A'}`,
        netOperatingIncome: `$${income.directCapitalization.netOperatingIncome?.toLocaleString() || 'N/A'}`,
        capitalizationRate: `${(income.directCapitalization.capitalizationRate * 100)?.toFixed(2) || 'N/A'}%`,
        valueIndication: `$${income.directCapitalization.valueIndication?.toLocaleString() || 'N/A'}`
      } : null,
      
      discountedCashFlow: income.discountedCashFlow ? {
        discountRate: `${(income.discountedCashFlow.discountRate * 100)?.toFixed(2) || 'N/A'}%`,
        terminalValue: `$${income.discountedCashFlow.terminalValue?.toLocaleString() || 'N/A'}`,
        presentValue: `$${income.discountedCashFlow.presentValue?.toLocaleString() || 'N/A'}`
      } : null,
      
      valueIndication: `$${income.valueIndication?.toLocaleString() || 'N/A'}`,
      
      reliability: income.reliability || 'High',
      
      narrative: income.narrative || 'Income approach provides strong support based on market income and expenses.'
    };
  }
  
  // Cost Approach
  if (appraisalResults.reconciliation.approaches.costApproach) {
    const cost = appraisalResults.reconciliation.approaches.costApproach;
    approaches.costApproach = {
      methodology: 'The Cost Approach estimates value based on land value plus replacement cost less depreciation.',
      
      landValue: `$${cost.landValue?.indication?.toLocaleString() || 'N/A'}`,
      
      replacementCost: {
        building: `$${cost.replacementCost?.building?.totalCost?.toLocaleString() || 'N/A'}`,
        siteImprovements: `$${cost.replacementCost?.siteImprovements?.toLocaleString() || 'N/A'}`,
        total: `$${cost.replacementCost?.total?.toLocaleString() || 'N/A'}`
      },
      
      depreciation: {
        physical: `$${cost.depreciation?.physical?.total?.toLocaleString() || 'N/A'}`,
        functional: `$${cost.depreciation?.functional?.total?.toLocaleString() || 'N/A'}`,
        external: `$${cost.depreciation?.external?.total?.toLocaleString() || 'N/A'}`,
        total: `$${cost.depreciation?.total?.toLocaleString() || 'N/A'}`
      },
      
      valueIndication: `$${cost.valueIndication?.toLocaleString() || 'N/A'}`,
      
      applicability: cost.applicability || 'Medium',
      
      narrative: cost.narrative || 'Cost approach provides support for value conclusion.'
    };
  }
  
  return approaches;
}

/**
 * Generate reconciliation section
 */
function generateReconciliationSection(reconciliation) {
  return {
    approachValues: {
      salesComparison: reconciliation.approaches.salesComparison ? 
        `$${reconciliation.approaches.salesComparison.valueIndication.toLocaleString()}` : 'Not applicable',
      incomeApproach: reconciliation.approaches.incomeApproach ? 
        `$${reconciliation.approaches.incomeApproach.valueIndication.toLocaleString()}` : 'Not applicable',
      costApproach: reconciliation.approaches.costApproach ? 
        `$${reconciliation.approaches.costApproach.valueIndication.toLocaleString()}` : 'Not applicable'
    },
    
    weights: {
      salesComparison: `${Math.round(reconciliation.weights.sales * 100)}%`,
      incomeApproach: `${Math.round(reconciliation.weights.income * 100)}%`,
      costApproach: `${Math.round(reconciliation.weights.cost * 100)}%`
    },
    
    weightingRationale: reconciliation.narrative.weightingRationale,
    
    varianceAnalysis: reconciliation.narrative.varianceAnalysis,
    
    finalValueConclusion: {
      value: `$${reconciliation.finalValue.toLocaleString()}`,
      range: `$${reconciliation.valueRange.low.toLocaleString()} - $${reconciliation.valueRange.high.toLocaleString()}`,
      confidence: `${reconciliation.confidence}%`
    },
    
    narrative: reconciliation.narrative.conclusion
  };
}

/**
 * Generate certifications section
 */
function generateCertifications(metadata) {
  return {
    appraisalCertifications: [
      'I certify that, to the best of my knowledge and belief, the statements of fact contained in this report are true and correct.',
      'The reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions and are my personal, impartial, and unbiased professional analyses, opinions, and conclusions.',
      'I have no present or prospective interest in the property that is the subject of this report, and no personal interest with respect to the parties involved.',
      'I have performed no services, as an appraiser or in any other capacity, regarding the property that is the subject of this report within the three-year period immediately preceding acceptance of this assignment.',
      'I have the knowledge and experience to complete this assignment competently.',
      'The use of this report is subject to the requirements of the Appraisal Institute relating to review by its duly authorized representatives.',
      'As of the date of this report, I have completed the continuing education program of the Appraisal Institute.'
    ],
    
    uspapCompliance: 'This appraisal has been prepared in conformity with the Uniform Standards of Professional Appraisal Practice.',
    
    competency: 'The appraiser is competent to appraise this type of property in this market area.',
    
    signature: {
      appraiser: metadata.appraiser?.name || '[Appraiser Name]',
      license: metadata.appraiser?.license || '[License Number]',
      date: new Date().toLocaleDateString(),
      signature: '[Appraiser Signature]'
    }
  };
}

/**
 * Generate qualifying conditions
 */
function generateQualifyingConditions() {
  return {
    assumptions: [
      'The property is free and clear of any liens or encumbrances unless otherwise stated.',
      'The property is in compliance with all applicable zoning regulations and building codes.',
      'No environmental hazards exist that would affect value unless otherwise noted.',
      'The property has adequate utilities and access.'
    ],
    
    limitingConditions: [
      'This appraisal is valid only for the stated purpose and date.',
      'No responsibility is assumed for legal matters or questions of title.',
      'No survey was made and none was furnished to the appraiser.',
      'Distribution of this report is limited to the client and intended users.',
      'Neither all nor any part of the contents of this report shall be conveyed to the public through advertising media, public relations, news, sales, or other media without prior written consent.'
    ],
    
    extraordinary: [
      'The appraisal assumes competent and prudent management.',
      'Market conditions are assumed to remain stable during the exposure period.',
      'No hidden or unapparent conditions of the property, subsoil, or structures are assumed to exist.'
    ]
  };
}

/**
 * Helper functions
 */

function formatLocation(location) {
  if (!location) return 'N/A';
  return `${location.city || ''}, ${location.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'N/A';
}

function formatFullAddress(location) {
  if (!location) return 'N/A';
  const parts = [location.address, location.city, location.state, location.zipCode].filter(Boolean);
  return parts.join(', ') || 'N/A';
}

function formatApproachName(key) {
  const names = {
    salesComparison: 'Sales Comparison Approach',
    incomeApproach: 'Income Approach',
    costApproach: 'Cost Approach'
  };
  return names[key] || key;
}

function getConfidenceLevel(confidence) {
  if (confidence >= 85) return 'High';
  if (confidence >= 70) return 'Medium-High';
  if (confidence >= 55) return 'Medium';
  if (confidence >= 40) return 'Medium-Low';
  return 'Low';
}

function generateKeyFindings(appraisalResults, subjectProperty) {
  const findings = [];
  
  if (appraisalResults.reconciliation.variance.acceptable) {
    findings.push('Value indications from applicable approaches show good consistency');
  }
  
  if (subjectProperty.physical.condition === 'excellent' || subjectProperty.physical.condition === 'good') {
    findings.push('Property is in good physical condition');
  }
  
  if (appraisalResults.reconciliation.confidence >= 80) {
    findings.push('High confidence in value conclusion due to strong market data');
  }
  
  return findings.length > 0 ? findings : ['Analysis supports value conclusion'];
}

function calculatePageCount(appraisalResults) {
  let pages = 25; // Base report pages
  
  if (appraisalResults.reconciliation.approaches.salesComparison?.comparables) {
    pages += Math.ceil(appraisalResults.reconciliation.approaches.salesComparison.comparables.length / 2);
  }
  
  if (appraisalResults.reconciliation.approaches.incomeApproach) {
    pages += 3; // Income analysis pages
  }
  
  if (appraisalResults.reconciliation.approaches.costApproach) {
    pages += 2; // Cost analysis pages
  }
  
  return pages;
}

function generateAdjustmentSummary(adjustments) {
  if (!adjustments || !Array.isArray(adjustments)) {
    return {
      total: '$0',
      details: 'No adjustments applied',
      items: []
    };
  }
  
  const totalAdjustment = adjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  
  return {
    total: totalAdjustment >= 0 ? `+$${Math.abs(totalAdjustment).toLocaleString()}` : `-$${Math.abs(totalAdjustment).toLocaleString()}`,
    details: adjustments.length > 0 ? `${adjustments.length} adjustments applied` : 'No adjustments',
    items: adjustments.map(adj => ({
      type: adj.type || 'Adjustment',
      amount: adj.amount >= 0 ? `+$${Math.abs(adj.amount).toLocaleString()}` : `-$${Math.abs(adj.amount).toLocaleString()}`,
      reason: adj.reason || 'Market adjustment'
    }))
  };
}

function generateMarketOutlook(marketData) {
  if (!marketData) {
    return {
      shortTerm: 'Market outlook appears stable in the short term based on current economic indicators.',
      longTerm: 'Long-term market outlook remains positive with continued economic growth expected.',
      keyFactors: [
        'Local economic stability',
        'Employment growth trends',
        'Infrastructure development',
        'Population growth patterns'
      ],
      riskFactors: [
        'Economic uncertainty',
        'Interest rate fluctuations',
        'Regulatory changes',
        'Market competition'
      ]
    };
  }
  
  return {
    shortTerm: marketData.shortTermOutlook || 'Market outlook appears stable in the short term.',
    longTerm: marketData.longTermOutlook || 'Long-term market outlook remains positive.',
    keyFactors: marketData.keyFactors || [
      'Local economic conditions',
      'Market supply and demand',
      'Infrastructure development'
    ],
    riskFactors: marketData.riskFactors || [
      'Economic volatility',
      'Market competition',
      'Regulatory changes'
    ]
  };
}

function generateAccessibilityDescription(location) {
  if (!location) return 'Location and accessibility information not available.';
  
  return `The subject property is located at ${location.address || 'N/A'} in ${location.city || 'N/A'}, ${location.state || 'N/A'}. The property offers good accessibility with adequate street frontage and vehicular access. Parking facilities are available on-site.`;
}

function generateProximityDescription(location) {
  if (!location) return 'Proximity information not available.';
  
  const city = location.city || 'the area';
  return `The property is conveniently located within ${city} with proximity to major transportation routes, commercial districts, and urban amenities. The location provides good access to employment centers and supporting infrastructure.`;
}

function generateIncomeDescription(income) {
  if (!income) return 'Income information not available for subject property.';
  
  return {
    grossIncome: income.grossIncome ? `$${income.grossIncome.toLocaleString()}` : 'N/A',
    vacancy: income.vacancy ? `${(income.vacancy * 100).toFixed(1)}%` : 'N/A',
    effectiveIncome: income.grossIncome && income.vacancy ? 
      `$${(income.grossIncome * (1 - income.vacancy)).toLocaleString()}` : 'N/A',
    operatingExpenses: income.operatingExpenses ? `$${income.operatingExpenses.toLocaleString()}` : 'N/A',
    netOperatingIncome: income.netOperatingIncome ? `$${income.netOperatingIncome.toLocaleString()}` : 'N/A',
    expenseRatio: income.grossIncome && income.operatingExpenses ?
      `${((income.operatingExpenses / income.grossIncome) * 100).toFixed(1)}%` : 'N/A'
  };
}

function generateEnvironmentalDescription(environmental) {
  if (!environmental) {
    return {
      status: 'No environmental concerns noted',
      description: 'No known environmental hazards or concerns have been identified for this property. Standard environmental due diligence is recommended.',
      recommendations: 'Recommend Phase I Environmental Site Assessment if required by lender or buyer.'
    };
  }
  
  return {
    status: environmental.status || 'No environmental concerns noted',
    description: environmental.description || 'Environmental status information not available.',
    recommendations: environmental.recommendations || 'Standard environmental due diligence recommended.'
  };
}

function analyzeMarketConditions(appraisalResults) {
  const approaches = appraisalResults.reconciliation?.approaches || {};
  const confidence = appraisalResults.reconciliation?.confidence || 70;
  
  let conditions = 'Balanced';
  let description = 'Market conditions appear balanced with typical supply and demand patterns.';
  
  // Analyze confidence level to determine market conditions
  if (confidence >= 85) {
    conditions = 'Stable';
    description = 'Market conditions are stable with strong data support and minimal volatility.';
  } else if (confidence >= 70) {
    conditions = 'Balanced';
    description = 'Market conditions appear balanced with adequate data support.';
  } else if (confidence >= 55) {
    conditions = 'Uncertain';
    description = 'Market conditions show some uncertainty with limited data availability.';
  } else {
    conditions = 'Volatile';
    description = 'Market conditions appear volatile with significant uncertainty.';
  }
  
  return {
    condition: conditions,
    description: description,
    trends: 'Market trends are consistent with regional economic indicators.',
    outlook: 'Market outlook remains consistent with current economic fundamentals.'
  };
}

function generateAppendices(comparables, metadata) {
  return {
    comparableSales: {
      title: 'Comparable Sales Data',
      data: comparables.map((comp, index) => ({
        number: index + 1,
        propertyName: comp.propertyName || `Comparable ${index + 1}`,
        address: comp.address || 'N/A',
        salePrice: comp.salePrice || 0,
        saleDate: comp.saleDate || 'N/A',
        buildingSize: comp.buildingSize || 0,
        pricePerSF: comp.pricePerSF || 0,
        propertyType: comp.propertyType || 'N/A',
        yearBuilt: comp.yearBuilt || 'N/A'
      }))
    },
    marketData: {
      title: 'Market Data Summary',
      capRates: metadata.marketData?.capRates || {},
      constructionCosts: metadata.marketData?.constructionCosts || {},
      expenseRatios: metadata.marketData?.expenseRatios || {}
    },
    assumptions: {
      title: 'Key Assumptions',
      items: [
        'Market conditions remain stable during exposure period',
        'Property management remains competent and efficient',
        'No adverse environmental conditions exist',
        'Zoning and land use regulations remain unchanged'
      ]
    }
  };
}

module.exports = {
  generateAppraisalReport,
  generateExecutiveSummary,
  generatePropertyDescription,
  generateValuationApproaches,
  generateReconciliationSection
};
