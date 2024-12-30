function getCurrentDate() {
  const now = new Date();

  // Extract date components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, '0');

  // Format the date
  const formattedDate = `${month}/${day}/${year}`;

  return formattedDate;
}

const currentDate = getCurrentDate();
export const data = [
  ["UUID", "123e4567-e89b-12d3-a456-426614174000"],
  ["ProfileID", "UAE-VAT12345"],
  ["GeneratedBy", "Avez's System Auto-Generated"],
  ["GeneratedOn", currentDate],
  ["InvoiceTypeCode", "Tax Invoice"],
  ["DocumentCurrencyCode", "AED"],
  ["TaxCurrencyCode", "AED"],
  ["AdditionalDocumentReference", "INV-REF-001"],
  ["TaxCategoryID", ""],
  ["TaxCategoryPercent", ""],
  ["TaxCategoryTaxScheme", "VAT"],
  [],
  ["VAT on Sales and all other Outputs"],
  ["", "Amount (AED)", "VAT Amount (AED)", "Adjustment Amount (AED)"],
  ["1a Standard rated supplies in Abu Dhabi", 20, 2500, 0],
  ["1b Standard rated supplies in Dubai", 75000, 3750, 0],
  ["1c Standard rated supplies in Sharjah", 25, 1250, 0],
  ["1d Standard rated supplies in Ajman", 10000, 500, 0],
  ["1e Standard rated supplies in Umm Al Quwain", 8000, 400, 0],
  ["1f Standard rated supplies in Ras Al Khaimah", 15000, 750, 0],
  ["1g Standard rated supplies in Fujairah", -5000, 250, 0],
  ["2 Tax Refunds provided to Tourists", "", "", ""],
  ["3 Supplies subject to the reverse charge provisions", 20000, 0, 0],
  ["4 Zero rated supplies", 12000, 0, 0],
  ["5 Exempt supplies", 6000, 0, 0],
  ["6 Goods imported into the UAE", 30000, 1500, 0],
  ["7 Adjustments to goods imported into the UAE", "", "", ""],
  ["8 Totals", 246000, 10900, 0],
  [],
  ["VAT on Expenses and all other Inputs"],
  ["", "Amount (AED)", "Recoverable VAT amount (AED)", "Adjustment Amount (AED)"],
  ["9 Standard rated expenses", 40000, 2000, 0],
  ["10 Supplies subject to the reverse charge provisions", 15000, 750, 0],
  ["11 Totals", 55000, 2750, 0],
  [],
  ["Net VAT Due"],
  ["12 Total value of due tax for the period", 10900],
  ["13 Total Value of recoverable tax for the period", 2750],
  ["14 Payable tax for the period", 8150],
  [],
  ["Profit Scheme", "TRUE"]
];

