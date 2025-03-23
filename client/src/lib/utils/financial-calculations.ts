/**
 * Calculate the monthly mortgage payment
 *
 * @param loanAmount - The total loan amount
 * @param annualInterestRate - The annual interest rate (as a percentage, e.g., 4.5)
 * @param loanTermYears - The loan term in years
 * @returns The monthly payment amount
 */
export function calculateMortgagePayment(
  loanAmount: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;
  
  if (monthlyInterestRate === 0) {
    return loanAmount / numberOfPayments;
  }
  
  const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
  const monthlyPayment = (loanAmount * x * monthlyInterestRate) / (x - 1);
  
  return monthlyPayment;
}

/**
 * Calculate the total interest paid over the life of the loan
 *
 * @param loanAmount - The total loan amount
 * @param monthlyPayment - The monthly payment amount
 * @param loanTermYears - The loan term in years
 * @returns The total interest paid
 */
export function calculateTotalInterest(
  loanAmount: number,
  monthlyPayment: number,
  loanTermYears: number
): number {
  const totalPayments = monthlyPayment * loanTermYears * 12;
  return totalPayments - loanAmount;
}

/**
 * Calculate the impact of mortgage overpayments
 *
 * @param loanAmount - The outstanding loan amount
 * @param annualInterestRate - The annual interest rate (as a percentage)
 * @param remainingTermYears - The remaining loan term in years
 * @param monthlyOverpayment - The additional monthly payment
 * @param annualLumpSum - The additional annual lump sum payment
 * @returns The months saved and interest saved
 */
export function calculateOverpaymentImpact(
  loanAmount: number,
  annualInterestRate: number,
  remainingTermYears: number,
  monthlyOverpayment: number,
  annualLumpSum: number
): { monthsSaved: number; interestSaved: number } {
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const monthlyPayment = calculateMortgagePayment(
    loanAmount,
    annualInterestRate,
    remainingTermYears
  );
  
  // Calculate original total interest
  const totalPayments = monthlyPayment * remainingTermYears * 12;
  const originalTotalInterest = totalPayments - loanAmount;
  
  // Calculate months with overpayment
  const monthlyLumpSumEquivalent = annualLumpSum / 12;
  const totalMonthlyOverpayment = monthlyOverpayment + monthlyLumpSumEquivalent;
  
  let balance = loanAmount;
  let monthsWithOverpayment = 0;
  let interestWithOverpayment = 0;
  
  while (balance > 0 && monthsWithOverpayment < remainingTermYears * 12) {
    const interestThisMonth = balance * monthlyInterestRate;
    interestWithOverpayment += interestThisMonth;
    
    let principalThisMonth = monthlyPayment - interestThisMonth;
    principalThisMonth += totalMonthlyOverpayment;
    
    balance -= principalThisMonth;
    monthsWithOverpayment++;
    
    if (balance <= 0) {
      break;
    }
  }
  
  const monthsSaved = remainingTermYears * 12 - monthsWithOverpayment;
  const interestSaved = originalTotalInterest - interestWithOverpayment;
  
  return { monthsSaved, interestSaved };
}

/**
 * Calculate future pension value
 *
 * @param currentValue - The current pension value
 * @param monthlyContribution - The monthly contribution
 * @param annualReturnRate - The annual return rate (as a percentage)
 * @param years - The number of years until retirement
 * @returns The future pension value
 */
export function calculatePensionProjection(
  currentValue: number,
  monthlyContribution: number,
  annualReturnRate: number,
  years: number
): number {
  const monthlyRate = annualReturnRate / 100 / 12;
  const months = years * 12;
  
  // Future value of current pension
  const futureValueOfCurrent = currentValue * Math.pow(1 + annualReturnRate / 100, years);
  
  // Future value of monthly contributions (annuity formula)
  let futureValueOfContributions = 0;
  
  if (monthlyRate > 0) {
    futureValueOfContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
  } else {
    futureValueOfContributions = monthlyContribution * months;
  }
  
  return futureValueOfCurrent + futureValueOfContributions;
}

/**
 * Calculate annual retirement income based on pension pot
 *
 * @param pensionPot - The total pension pot value
 * @param withdrawalRate - The annual withdrawal rate (as a percentage, default 4%)
 * @returns The annual retirement income
 */
export function calculateAnnualRetirementIncome(
  pensionPot: number,
  withdrawalRate: number = 4
): number {
  return pensionPot * (withdrawalRate / 100);
}

/**
 * Calculate compound interest growth
 *
 * @param principal - The initial investment amount
 * @param monthlyContribution - The monthly contribution
 * @param annualInterestRate - The annual interest rate (as a percentage)
 * @param years - The number of years
 * @returns The future value
 */
export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualInterestRate: number,
  years: number
): number {
  const monthlyRate = annualInterestRate / 100 / 12;
  const months = years * 12;
  
  // Future value of principal
  const futureValueOfPrincipal = principal * Math.pow(1 + monthlyRate, months);
  
  // Future value of monthly deposits
  let futureValueOfDeposits = 0;
  
  if (monthlyRate > 0) {
    futureValueOfDeposits = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  } else {
    futureValueOfDeposits = monthlyContribution * months;
  }
  
  return futureValueOfPrincipal + futureValueOfDeposits;
}

/**
 * Format currency values
 *
 * @param value - The number to format as currency
 * @param currency - The currency symbol (default £)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = "£"): string {
  return `${currency}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculate monthly budget progress
 *
 * @param current - The current spending amount
 * @param target - The target budget amount
 * @returns The percentage and overspend status
 */
export function calculateBudgetProgress(
  current: number,
  target: number
): { percentage: number; isOverBudget: boolean } {
  // Handle division by zero case
  if (target === 0) {
    return {
      percentage: 100,
      isOverBudget: current > 0,
    };
  }
  
  const percentage = Math.round((current / target) * 100);
  return {
    percentage,
    isOverBudget: percentage > 100,
  };
}
