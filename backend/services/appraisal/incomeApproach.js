/**
 * Income Capitalization Approach Implementation
 * Direct Capitalization and DCF Analysis
 */

/**
 * Calculate Income Approach value using both Direct Cap and DCF
 */
async function calculateIncomeApproach(subjectProperty, rentalComparables, marketData) {
  console.log('💰 Starting Income Approach Analysis...');
  
  // Validate income data
  if (!subjectProperty.income || !subjectProperty.expenses) {
    throw new Error('Income and expense data required for Income Approach');
  }
  
  // Method 1: Direct Capitalization
  const directCap = await calculateDirectCapitalization(subjectProperty, marketData);
  
  // Method 2: DCF Analysis (for complex properties)
  const dcfAnalysis = await calculateDCF(subjectProperty, marketData);
  
  // Reconcile methods
  const reconciliation = reconcileIncomeMethods(directCap, dcfAnalysis, subjectProperty);
  
  return {
    approach: 'Income Capitalization',
    directCapitalization: directCap,
    discountedCashFlow: dcfAnalysis,
    valueIndication: reconciliation.value,
    confidence: reconciliation.confidence,
    dataQuality: reconciliation.dataQuality,
    narrative: generateIncomeNarrative(directCap, dcfAnalysis, reconciliation)
  };
}

/**
 * Calculate Direct Capitalization Method
 */
async function calculateDirectCapitalization(subjectProperty, marketData) {
  // Step 1: Analyze Potential Gross Income
  const pgi = calculatePotentialGrossIncome(subjectProperty, marketData);
  
  // Step 2: Calculate Vacancy & Collection Loss
  const vacancy = calculateVacancyLoss(subjectProperty, marketData);
  
  // Step 3: Calculate Other Income
  const otherIncome = subjectProperty.income.otherIncome || 0;
  
  // Step 4: Effective Gross Income
  const egi = pgi - vacancy + otherIncome;
  
  // Step 5: Operating Expenses
  const expenses = calculateOperatingExpenses(subjectProperty, marketData);
  
  // Step 6: Net Operating Income
  const noi = egi - expenses.total;
  
  // Step 7: Capitalization Rate Selection
  const capRate = selectCapitalizationRate(subjectProperty, marketData);
  
  // Step 8: Value Indication
  const valueIndication = noi / (capRate.selected / 100);
  
  return {
    method: 'Direct Capitalization',
    income: {
      potentialGrossIncome: pgi,
      vacancyLoss: vacancy,
      otherIncome,
      effectiveGrossIncome: egi
    },
    expenses,
    netOperatingIncome: noi,
    capitalizationRate: capRate,
    valueIndication: Math.round(valueIndication),
    confidence: calculateDirectCapConfidence(subjectProperty, marketData)
  };
}

/**
 * Calculate operating expenses with industry standards
 */
function calculateOperatingExpenses(subjectProperty, marketData) {
  const egi = subjectProperty.income.effectiveGrossIncome;
  const propertyType = subjectProperty.propertyType;
  
  // Get expense ratios by property type
  const expenseRatios = getExpenseRatios(propertyType, marketData);
  
  const expenses = {
    // Fixed Expenses
    realEstateTaxes: subjectProperty.expenses.realEstateTaxes || (egi * expenseRatios.taxes),
    insurance: subjectProperty.expenses.insurance || (egi * expenseRatios.insurance),
    
    // Variable Expenses  
    utilities: subjectProperty.expenses.utilities || (egi * expenseRatios.utilities),
    maintenance: subjectProperty.expenses.maintenance || (egi * expenseRatios.maintenance),
    management: subjectProperty.expenses.management || (egi * expenseRatios.management),
    
    // Reserves
    reserves: subjectProperty.expenses.reserves || (egi * expenseRatios.reserves),
    
    // Other
    other: subjectProperty.expenses.other || 0
  };
  
  expenses.total = Object.values(expenses).reduce((sum, expense) => sum + expense, 0);
  expenses.ratio = expenses.total / egi;
  
  return expenses;
}

/**
 * Select appropriate capitalization rate
 */
function selectCapitalizationRate(subjectProperty, marketData) {
  const propertyType = subjectProperty.propertyType;
  const location = subjectProperty.location;
  
  // Base cap rate from market data
  const baseCapRate = marketData.capRates?.[propertyType]?.base || 7.0;
  
  // Risk adjustments
  let riskAdjustment = 0;
  
  // Location risk
  if (location.neighborhood === 'A') riskAdjustment -= 0.5;
  else if (location.neighborhood === 'C') riskAdjustment += 0.5;
  
  // Tenant quality risk
  const tenantQuality = calculateTenantQuality(subjectProperty.income.rentRoll);
  if (tenantQuality > 4) riskAdjustment -= 0.25;
  else if (tenantQuality < 3) riskAdjustment += 0.5;
  
  // Age/condition risk
  const buildingAge = new Date().getFullYear() - subjectProperty.physical.construction.yearBuilt;
  if (buildingAge > 30) riskAdjustment += 0.25;
  if (subjectProperty.physical.condition.overall < 3) riskAdjustment += 0.5;
  
  const selectedCapRate = baseCapRate + riskAdjustment;
  
  return {
    base: baseCapRate,
    riskAdjustment,
    selected: Math.max(4.0, Math.min(12.0, selectedCapRate)), // Cap between 4-12%
    rationale: `Base: ${baseCapRate}%, Risk adj: ${riskAdjustment > 0 ? '+' : ''}${riskAdjustment}%`
  };
}

/**
 * DCF Analysis for complex properties
 */
async function calculateDCF(subjectProperty, marketData, projectionPeriod = 10) {
  const projections = [];
  const growthRates = getGrowthRates(subjectProperty, marketData);
  
  let baseNOI = calculateCurrentNOI(subjectProperty);
  
  for (let year = 1; year <= projectionPeriod; year++) {
    const projection = {
      year,
      grossIncome: calculateProjectedIncome(subjectProperty, year, growthRates),
      vacancy: calculateProjectedVacancy(subjectProperty, year, marketData),
      expenses: calculateProjectedExpenses(subjectProperty, year, growthRates),
      noi: 0,
      cashFlow: 0
    };
    
    projection.noi = projection.grossIncome - projection.vacancy - projection.expenses;
    projection.cashFlow = projection.noi;
    projections.push(projection);
  }
  
  // Terminal value
  const terminalNOI = projections[projectionPeriod - 1].noi * (1 + growthRates.terminal);
  const terminalCapRate = selectCapitalizationRate(subjectProperty, marketData).selected + 0.5;
  const terminalValue = terminalNOI / (terminalCapRate / 100);
  
  // Present value calculation
  const discountRate = selectDiscountRate(subjectProperty, marketData);
  const presentValueCashFlows = projections.reduce((sum, proj, index) => {
    return sum + (proj.cashFlow / Math.pow(1 + discountRate / 100, index + 1));
  }, 0);
  
  const presentValueTerminal = terminalValue / Math.pow(1 + discountRate / 100, projectionPeriod);
  const totalValue = presentValueCashFlows + presentValueTerminal;
  
  return {
    method: 'Discounted Cash Flow',
    projectionPeriod,
    projections,
    terminalValue,
    discountRate,
    presentValueCashFlows,
    presentValueTerminal,
    valueIndication: Math.round(totalValue),
    assumptions: {
      incomeGrowth: growthRates.income,
      expenseGrowth: growthRates.expenses,
      terminalGrowth: growthRates.terminal,
      discountRate
    }
  };
}

function getExpenseRatios(propertyType, marketData) {
  const defaults = {
    'Office': { taxes: 0.025, insurance: 0.005, utilities: 0.03, maintenance: 0.02, management: 0.05, reserves: 0.02 },
    'Retail': { taxes: 0.02, insurance: 0.005, utilities: 0.025, maintenance: 0.025, management: 0.04, reserves: 0.025 },
    'Industrial': { taxes: 0.02, insurance: 0.004, utilities: 0.015, maintenance: 0.015, management: 0.03, reserves: 0.015 },
    'Multifamily': { taxes: 0.025, insurance: 0.008, utilities: 0.035, maintenance: 0.03, management: 0.06, reserves: 0.03 }
  };
  
  return marketData.expenseRatios?.[propertyType] || defaults[propertyType] || defaults['Office'];
}

module.exports = {
  calculateIncomeApproach,
  calculateDirectCapitalization,
  calculateDCF
};
