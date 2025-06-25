/**
 * Comprehensive Commercial Real Estate Appraisal Engine
 * Following USPAP Guidelines and Industry Standards
 */

const { calculateSalesComparison } = require('./salesComparisonApproach');
const { calculateIncomeApproach } = require('./incomeApproach');
const { calculateCostApproach } = require('./costApproach');
const { analyzeHighestAndBestUse } = require('./highestBestUse');
const { validateAppraisalData } = require('./validation');
const { reconcileToFinalValue } = require('./reconciliation');
const { generateAppraisalReport } = require('./reportGeneration');

/**
 * Main appraisal engine - coordinates all valuation approaches
 */
class AppraisalEngine {
  
  /**
   * Generate comprehensive commercial property appraisal
   * @param {Object} subjectProperty - Complete subject property data
   * @param {Array} comparables - Array of comparable sales/rental data
   * @param {Object} marketData - Market conditions and trends
   * @param {Object} options - Appraisal options and preferences
   * @returns {Object} Complete appraisal results
   */
  async generateAppraisal(subjectProperty, comparables, marketData, options = {}) {
    // Ensure real data is provided, not relying on old test data
    if (!subjectProperty || !comparables || comparables.length === 0) {
      // throw new Error('A subject property and at least one comparable property are required to generate an appraisal.');
      // Return a structured error that the frontend can parse
      return {
        error: true,
        message: 'A subject property and at least one comparable property are required to generate an appraisal.',
        valuation: null,
        report: null,
      };
    }
    try {
      console.log('🏢 Starting comprehensive appraisal generation...');
      
      // Phase 1: Data Validation
      const validationResults = await validateAppraisalData(subjectProperty, comparables, marketData);
      if (!validationResults.isValid) {
        throw new Error(`Data validation failed: ${validationResults.errors.join(', ')}`);
      }
      
      // Phase 2: Highest and Best Use Analysis
      const hbuAnalysis = await analyzeHighestAndBestUse(subjectProperty, marketData);
      
      // Phase 3: Apply all three approaches to value
      console.log('🏗️ Calculating all valuation approaches...');
      let approaches, reconciliation, report;
      
      try {
        approaches = await this.calculateAllApproaches(subjectProperty, comparables, marketData, options);
        if (!approaches) {
          throw new Error('Failed to calculate valuation approaches');
        }
      } catch (error) {
        throw new Error(`Error in Phase 3 (Valuation Approaches): ${error.message}`);
      }
      
      // Phase 4: Reconcile to final value
      console.log('⚖️ Performing value reconciliation...');
      try {
        reconciliation = await reconcileToFinalValue(
          approaches.salesComparison,
          approaches.incomeApproach,
          approaches.costApproach,
          subjectProperty,
          options
        );
        if (!reconciliation) {
          throw new Error('Failed to reconcile to final value');
        }
      } catch (error) {
        throw new Error(`Error in Phase 4 (Value Reconciliation): ${error.message}`);
      }
      
      // Phase 5: Generate professional report
      console.log('📄 Generating professional appraisal report...');
      try {
        report = await generateAppraisalReport({
          subjectProperty,
          comparables,
          marketData,
          hbuAnalysis,
          approaches,
          reconciliation,
          validationResults,
          options
        });
        if (!report) {
          throw new Error('Failed to generate appraisal report');
        }
      } catch (error) {
        throw new Error(`Error in Phase 5 (Report Generation): ${error.message}`);
      }
      
      const finalAppraisal = {
        appraisalId: this.generateAppraisalId(),
        timestamp: new Date().toISOString(),
        subjectProperty,
        highestAndBestUse: hbuAnalysis,
        valuationApproaches: approaches,
        reconciliation,
        finalValue: reconciliation.finalValue,
        valueRange: reconciliation.valueRange,
        confidence: this.calculateOverallConfidence(approaches, reconciliation),
        report,
        compliance: {
          uspap: true,
          reviewStatus: 'pending',
          qualityScore: this.calculateQualityScore(approaches, reconciliation)
        }
      };
      
      console.log(`✅ Appraisal completed - Final Value: $${finalAppraisal.finalValue.toLocaleString()}`);
      return finalAppraisal;
      
    } catch (error) {
      console.error('❌ Appraisal generation failed:', error);
      throw new Error(`Appraisal generation failed: ${error.message}`);
    }
  }
  
  /**
   * Calculate all three approaches to value
   */
  async calculateAllApproaches(subjectProperty, comparables, marketData, options) {
    const approaches = {};
    
    // Sales Comparison Approach
    if (this.shouldApplySalesComparison(subjectProperty, comparables)) {
      console.log('📊 Calculating Sales Comparison Approach...');
      approaches.salesComparison = await calculateSalesComparison(
        subjectProperty, 
        comparables.sales, 
        marketData
      );
    }
    
    // Income Capitalization Approach
    if (this.shouldApplyIncomeApproach(subjectProperty)) {
      console.log('💰 Calculating Income Approach...');
      approaches.incomeApproach = await calculateIncomeApproach(
        subjectProperty, 
        comparables.rentals, 
        marketData
      );
    }
    
    // Cost Approach
    if (this.shouldApplyCostApproach(subjectProperty, options)) {
      console.log('🏗️ Calculating Cost Approach...');
      approaches.costApproach = await calculateCostApproach(
        subjectProperty, 
        marketData
      );
    }
    
    return approaches;
  }
  
  /**
   * Determine if Sales Comparison Approach should be applied
   */
  shouldApplySalesComparison(subjectProperty, comparables) {
    return comparables.sales && 
           comparables.sales.length >= 3 && 
           subjectProperty.physical && 
           subjectProperty.physical.buildingArea;
  }
  
  /**
   * Determine if Income Approach should be applied
   */
  shouldApplyIncomeApproach(subjectProperty) {
    return subjectProperty.income && 
           (subjectProperty.income.totalUnits > 0 || 
            subjectProperty.income.potentialGrossIncome > 0);
  }
  
  /**
   * Determine if Cost Approach should be applied
   */
  shouldApplyCostApproach(subjectProperty, options) {
    // Apply for newer properties, special use, or when requested
    const buildingAge = new Date().getFullYear() - subjectProperty.physical.construction.yearBuilt;
    return options.includeCostApproach || 
           buildingAge < 10 || 
           subjectProperty.physical.specialUse;
  }
  
  /**
   * Calculate overall confidence score
   */
  calculateOverallConfidence(approaches, reconciliation) {
    let totalConfidence = 0;
    let weightSum = 0;
    
    if (approaches.salesComparison) {
      totalConfidence += approaches.salesComparison.confidence * reconciliation.weights.sales;
      weightSum += reconciliation.weights.sales;
    }
    
    if (approaches.incomeApproach) {
      totalConfidence += approaches.incomeApproach.confidence * reconciliation.weights.income;
      weightSum += reconciliation.weights.income;
    }
    
    if (approaches.costApproach) {
      totalConfidence += approaches.costApproach.confidence * reconciliation.weights.cost;
      weightSum += reconciliation.weights.cost;
    }
    
    return weightSum > 0 ? Math.round(totalConfidence / weightSum) : 0;
  }
  
  /**
   * Calculate quality score for the appraisal
   */
  calculateQualityScore(approaches, reconciliation) {
    let score = 0;
    
    // Data quality factors
    if (approaches.salesComparison && approaches.salesComparison.comparables.length >= 5) score += 20;
    if (approaches.incomeApproach && approaches.incomeApproach.dataQuality === 'high') score += 25;
    if (approaches.costApproach && approaches.costApproach.applicability === 'high') score += 15;
    
    // Reconciliation factors
    if (reconciliation.valueVariance < 0.1) score += 25; // Values within 10%
    if (reconciliation.weights.sales + reconciliation.weights.income >= 0.8) score += 15;
    
    return Math.min(score, 100);
  }
  
  /**
   * Generate unique appraisal ID
   */
  generateAppraisalId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `APR-${timestamp}-${random}`.toUpperCase();
  }
}

module.exports = AppraisalEngine;
